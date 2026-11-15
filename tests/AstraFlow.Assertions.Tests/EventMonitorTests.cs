using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class EventMonitorTests
{
    [Fact]
    public void EventMonitor_CapturesRaisesAndSupportsNegativeAndExactCountAssertions()
    {
        var source = new EventSource();
        using var monitor = new EventMonitor()
            .Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler)
            .Watch<MessageEventArgs>(nameof(EventSource.Changed), handler => source.Changed += handler, handler => source.Changed -= handler)
            .Watch<MessageEventArgs>(nameof(EventSource.Stopped), handler => source.Stopped += handler, handler => source.Stopped -= handler);

        source.RaiseStarted("private-payload");
        source.RaiseChanged("changed");
        source.RaiseChanged("changed-again");

        monitor.Should()
            .Raise(nameof(EventSource.Started))
            .RaiseTimes(nameof(EventSource.Changed), 2)
            .NotRaise(nameof(EventSource.Stopped))
            .RaiseInOrder(nameof(EventSource.Started), nameof(EventSource.Changed), nameof(EventSource.Changed));

        Assert.Equal(new[] { 1, 2, 3 }, new[]
        {
            monitor.OccurredEvents[0].Sequence,
            monitor.OccurredEvents[1].Sequence,
            monitor.OccurredEvents[2].Sequence
        });
        Assert.Equal("private-payload", ((MessageEventArgs)monitor.OccurredEvents[0].Arguments!).Message);
    }

    [Fact]
    public void EventMonitor_ReportsOnlyEventMetadataAndNeverRendersPayload()
    {
        var source = new EventSource();
        using var monitor = new EventMonitor()
            .Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler);
        source.RaiseStarted("payload-must-not-appear");

        var failure = Assert.Throws<AstraFlowAssertionException>(() => monitor.Should().NotRaise(nameof(EventSource.Started)));

        Assert.Contains(nameof(EventSource.Started), failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("payload-must-not-appear", failure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void EventMonitor_UnsubscribesOnceOnDisposeAndIgnoresLaterRaises()
    {
        var source = new EventSource();
        var monitor = new EventMonitor()
            .Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler);
        source.RaiseStarted("before-dispose");

        monitor.Dispose();
        monitor.Dispose();
        source.RaiseStarted("after-dispose");

        Assert.Single(monitor.OccurredEvents);
        Assert.Throws<ObjectDisposedException>(() => monitor.Watch<MessageEventArgs>(nameof(EventSource.Changed),
            handler => source.Changed += handler, handler => source.Changed -= handler));
        Assert.Equal(0, source.StartedSubscriberCount);
    }

    [Fact]
    public void EventMonitor_DisposesAllHandlersWhenOneRemovalFails()
    {
        var source = new EventSource();
        var monitor = new EventMonitor()
            .Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler)
            .Watch<MessageEventArgs>(nameof(EventSource.Changed), handler => source.Changed += handler, _ => throw new InvalidOperationException("remove failed"));

        var failure = Assert.Throws<AggregateException>(() => monitor.Dispose());

        Assert.Single(failure.InnerExceptions);
        Assert.Equal(0, source.StartedSubscriberCount);
        Assert.Equal(1, source.ChangedSubscriberCount);
        source.RaiseChanged("ignored-after-dispose");
        Assert.Empty(monitor.OccurredEvents);
    }

    [Fact]
    public void EventMonitor_RemovesHandlerWhenSubscriptionAccessorThrowsAfterAttaching()
    {
        var source = new EventSource();
        var monitor = new EventMonitor();

        Assert.Throws<InvalidOperationException>(() => monitor.Watch<MessageEventArgs>(nameof(EventSource.Started),
            handler =>
            {
                source.Started += handler;
                throw new InvalidOperationException("add failed");
            },
            handler => source.Started -= handler));

        Assert.Equal(0, source.StartedSubscriberCount);
        Assert.Throws<InvalidOperationException>(() => monitor.Should().Raise(nameof(EventSource.Started)));
        monitor.Dispose();
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void EventMonitor_InvalidatesFailedRegistrationAndRetainsFailedRollbackForDisposal(bool removalKeepsFailing)
    {
        var source = new EventSource();
        var monitor = new EventMonitor();
        var removalAttempts = 0;
        var addFailure = new InvalidOperationException("add failed");
        var removeFailure = new InvalidOperationException("remove failed");

        var failure = Assert.Throws<AggregateException>(() => monitor.Watch<MessageEventArgs>(nameof(EventSource.Started),
            handler =>
            {
                source.Started += handler;
                throw addFailure;
            },
            handler =>
            {
                removalAttempts++;
                if (removalAttempts == 1 || removalKeepsFailing)
                {
                    throw removeFailure;
                }

                source.Started -= handler;
            }));

        Assert.Equal(new Exception[] { addFailure, removeFailure }, failure.InnerExceptions);
        Assert.Equal(1, source.StartedSubscriberCount);
        source.RaiseStarted("ignored-after-failed-registration");
        Assert.Empty(monitor.OccurredEvents);
        Assert.Throws<InvalidOperationException>(() => monitor.Should().Raise(nameof(EventSource.Started)));

        monitor.Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler);
        source.RaiseStarted("valid-retry");

        monitor.Should().RaiseTimes(nameof(EventSource.Started), 1).RaiseInOrder(nameof(EventSource.Started));
        Assert.Equal(1, Assert.Single(monitor.OccurredEvents).Sequence);

        if (removalKeepsFailing)
        {
            var disposalFailure = Assert.Throws<AggregateException>(() => monitor.Dispose());
            Assert.Same(removeFailure, Assert.Single(disposalFailure.InnerExceptions));
        }
        else
        {
            monitor.Dispose();
        }

        monitor.Dispose();
        Assert.Equal(2, removalAttempts);
        Assert.Equal(removalKeepsFailing ? 1 : 0, source.StartedSubscriberCount);
        source.RaiseStarted("ignored-after-disposal");
        Assert.Single(monitor.OccurredEvents);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task EventMonitor_RetriesFailedRollbackWhenDisposalCompletesDuringRemoval(bool finalRemovalFails)
    {
        var source = new EventSource();
        var monitor = new EventMonitor();
        var rollbackEntered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        using var releaseRollback = new ManualResetEventSlim();
        var removalAttempts = 0;
        var addFailure = new InvalidOperationException("add failed");
        var rollbackFailure = new InvalidOperationException("rollback failed");
        var finalRemovalFailure = new InvalidOperationException("final removal failed");

        var watch = Task.Run(() => Assert.Throws<AggregateException>(() => monitor.Watch<MessageEventArgs>(nameof(EventSource.Started),
            handler =>
            {
                source.Started += handler;
                throw addFailure;
            },
            handler =>
            {
                if (Interlocked.Increment(ref removalAttempts) == 1)
                {
                    rollbackEntered.SetResult();
                    if (!releaseRollback.Wait(TimeSpan.FromSeconds(10)))
                    {
                        throw new TimeoutException("Rollback was not released.");
                    }

                    throw rollbackFailure;
                }

                if (finalRemovalFails)
                {
                    throw finalRemovalFailure;
                }

                source.Started -= handler;
            })));

        try
        {
            await rollbackEntered.Task.WaitAsync(TimeSpan.FromSeconds(10));
            await Task.Run(() => monitor.Dispose()).WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(1, source.StartedSubscriberCount);
            source.RaiseStarted("ignored-while-rollback-is-blocked");
            Assert.Empty(monitor.OccurredEvents);
        }
        finally
        {
            releaseRollback.Set();
        }

        var failure = await watch.WaitAsync(TimeSpan.FromSeconds(10));

        Assert.Equal(finalRemovalFails
            ? new Exception[] { addFailure, rollbackFailure, finalRemovalFailure }
            : new Exception[] { addFailure, rollbackFailure }, failure.InnerExceptions);
        Assert.Equal(2, removalAttempts);
        Assert.Equal(finalRemovalFails ? 1 : 0, source.StartedSubscriberCount);
        monitor.Dispose();
        Assert.Equal(2, removalAttempts);
        source.RaiseStarted("ignored-after-final-cleanup");
        Assert.Empty(monitor.OccurredEvents);
    }

    [Fact]
    public void EventMonitor_IsThreadSafeWhenEventsAreRaisedConcurrently()
    {
        var source = new EventSource();
        using var monitor = new EventMonitor()
            .Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler);

        Parallel.For(0, 500, index => source.RaiseStarted(index.ToString()));

        Assert.Equal(500, monitor.OccurredEvents.Count);
        for (var index = 0; index < monitor.OccurredEvents.Count; index++)
        {
            Assert.Equal(index + 1, monitor.OccurredEvents[index].Sequence);
        }
    }

    [Fact]
    public void EventMonitor_SupportsNonGenericEventHandler()
    {
        var source = new NonGenericEventSource();
        using var monitor = new EventMonitor()
            .Watch(nameof(NonGenericEventSource.Completed), handler => source.Completed += handler, handler => source.Completed -= handler);

        source.RaiseCompleted();

        monitor.Should().RaiseTimes(nameof(NonGenericEventSource.Completed), 1);
    }

    [Fact]
    public void EventMonitor_WatchesCustomDelegatesAndCapturesArbitraryPayloads()
    {
        var source = new CustomPayloadEventSource();
        using var monitor = new EventMonitor()
            .Watch<CustomPayloadEventHandler>(
                nameof(CustomPayloadEventSource.PayloadReceived),
                handler => source.PayloadReceived += handler,
                handler => source.PayloadReceived -= handler,
                capture => (sender, payload) => capture(sender, payload));

        source.RaisePayload("private-payload");

        monitor.Should().RaiseTimes(nameof(CustomPayloadEventSource.PayloadReceived), 1);
        var occurrence = Assert.Single(monitor.OccurredEvents);
        Assert.Same(source, occurrence.Sender);
        Assert.Equal("private-payload", occurrence.Payload);
        Assert.Null(occurrence.Arguments);
        Assert.Equal(1, source.SubscriberCount);
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => monitor.Should().NotRaise(nameof(CustomPayloadEventSource.PayloadReceived)));
        Assert.DoesNotContain("private-payload", failure.Message, StringComparison.Ordinal);

        monitor.Dispose();
        Assert.Equal(0, source.SubscriberCount);
    }

    [Fact]
    public void EventMonitor_ClearsRegistrationWhenCustomHandlerFactoryFails()
    {
        var source = new CustomPayloadEventSource();
        using var monitor = new EventMonitor();

        Assert.Throws<InvalidOperationException>(() => monitor.Watch<CustomPayloadEventHandler>(
            nameof(CustomPayloadEventSource.PayloadReceived),
            handler => source.PayloadReceived += handler,
            handler => source.PayloadReceived -= handler,
            _ => throw new InvalidOperationException("factory-failure")));

        monitor.Watch<CustomPayloadEventHandler>(
            nameof(CustomPayloadEventSource.PayloadReceived),
            handler => source.PayloadReceived += handler,
            handler => source.PayloadReceived -= handler,
            capture => (sender, payload) => capture(sender, payload));

        source.RaisePayload("captured");
        monitor.Should().RaiseTimes(nameof(CustomPayloadEventSource.PayloadReceived), 1);
    }

    [Fact]
    public void EventMonitor_AssertsPropertyChangedEventsAndTreatsEmptyNameAsAllProperties()
    {
        var source = new PropertyChangeSource();
        using var monitor = new EventMonitor()
            .WatchPropertyChanged(handler => source.PropertyChanged += handler, handler => source.PropertyChanged -= handler);

        source.Raise("Name");

        monitor.Should()
            .RaisePropertyChange()
            .RaisePropertyChangeFor("Name")
            .NotRaisePropertyChangeFor("Age");

        Assert.Throws<AstraFlowAssertionException>(() => monitor.Should().NotRaisePropertyChange());
        Assert.Throws<AstraFlowAssertionException>(() => monitor.Should().RaisePropertyChangeFor("Age"));

        var broadcastSource = new PropertyChangeSource();
        using var broadcastMonitor = new EventMonitor()
            .WatchPropertyChanged(handler => broadcastSource.PropertyChanged += handler, handler => broadcastSource.PropertyChanged -= handler);
        broadcastSource.Raise(null);

        broadcastMonitor.Should().RaisePropertyChangeFor("Name");
        Assert.Throws<AstraFlowAssertionException>(() => broadcastMonitor.Should().NotRaisePropertyChangeFor("Name"));
        Assert.Throws<ArgumentException>(() => broadcastMonitor.Should().RaisePropertyChangeFor(" "));
    }

    [Fact]
    public void EventMonitor_RejectsInvalidAndDuplicateRegistrations()
    {
        var source = new EventSource();
        var monitor = new EventMonitor();

        Assert.Throws<ArgumentException>(() => monitor.Watch<MessageEventArgs>(" ", handler => source.Started += handler, handler => source.Started -= handler));
        monitor.Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler);
        Assert.Throws<ArgumentException>(() => monitor.Watch<MessageEventArgs>(nameof(EventSource.Started), handler => source.Started += handler, handler => source.Started -= handler));
        Assert.Throws<ArgumentOutOfRangeException>(() => monitor.Should().RaiseTimes(nameof(EventSource.Started), -1));
        Assert.Throws<InvalidOperationException>(() => monitor.Should().RaiseInOrder("Unwatched"));

        monitor.Dispose();
    }

    private sealed class EventSource
    {
        public event EventHandler<MessageEventArgs>? Started;
        public event EventHandler<MessageEventArgs>? Changed;
        public event EventHandler<MessageEventArgs>? Stopped;

        public int StartedSubscriberCount => Started?.GetInvocationList().Length ?? 0;
        public int ChangedSubscriberCount => Changed?.GetInvocationList().Length ?? 0;

        public void RaiseStarted(string message) => Started?.Invoke(this, new MessageEventArgs(message));
        public void RaiseChanged(string message) => Changed?.Invoke(this, new MessageEventArgs(message));
    }

    private sealed class NonGenericEventSource
    {
        public event EventHandler? Completed;
        public void RaiseCompleted() => Completed?.Invoke(this, EventArgs.Empty);
    }

    private delegate void CustomPayloadEventHandler(CustomPayloadEventSource sender, string payload);

    private sealed class CustomPayloadEventSource
    {
        public event CustomPayloadEventHandler? PayloadReceived;

        public int SubscriberCount => PayloadReceived?.GetInvocationList().Length ?? 0;

        public void RaisePayload(string payload) => PayloadReceived?.Invoke(this, payload);
    }

    private sealed class PropertyChangeSource : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;
        public void Raise(string? propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    private sealed class MessageEventArgs : EventArgs
    {
        public MessageEventArgs(string message) => Message = message;
        public string Message { get; }
    }
}
