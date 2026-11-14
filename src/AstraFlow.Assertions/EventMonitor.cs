using System.Collections.Generic;
using System;
using System.ComponentModel;

namespace AstraFlow.Assertions;

/// <summary>Records selected .NET event notifications for the lifetime of a disposable monitor.</summary>
/// <remarks>
/// Event handlers are removed when the monitor is disposed. Events with custom delegate signatures can be watched by
/// supplying a typed handler factory.
/// </remarks>
public sealed class EventMonitor : IDisposable
{
    private readonly object _gate = new();
    private readonly Dictionary<string, object> _eventRegistrations = new(StringComparer.Ordinal);
    private readonly List<EventOccurrence> _occurredEvents = new();
    private readonly List<Action> _unsubscriptions = new();
    private bool _disposed;

    /// <summary>Gets a snapshot of the events observed so far, in capture order.</summary>
    public IReadOnlyList<EventOccurrence> OccurredEvents
    {
        get
        {
            lock (_gate)
            {
                return _occurredEvents.ToArray();
            }
        }
    }

    /// <summary>Subscribes to a non-generic <see cref="EventHandler"/> event.</summary>
    /// <param name="eventName">A stable name used by event assertions.</param>
    /// <param name="subscribe">The event add accessor.</param>
    /// <param name="unsubscribe">The matching event remove accessor.</param>
    /// <returns>This monitor, so multiple events can be registered together.</returns>
    public EventMonitor Watch(string eventName, Action<EventHandler> subscribe, Action<EventHandler> unsubscribe)
    {
        if (subscribe is null)
        {
            throw new ArgumentNullException(nameof(subscribe));
        }

        if (unsubscribe is null)
        {
            throw new ArgumentNullException(nameof(unsubscribe));
        }

        return WatchCore(eventName, capture =>
        {
            EventHandler eventHandler = (sender, args) => capture(sender, args);
            return new EventSubscription(() => subscribe(eventHandler), () => unsubscribe(eventHandler));
        });
    }

    /// <summary>Subscribes to a generic <see cref="EventHandler{TEventArgs}"/> event.</summary>
    /// <typeparam name="TEventArgs">The event argument type.</typeparam>
    /// <param name="eventName">A stable name used by event assertions.</param>
    /// <param name="subscribe">The event add accessor.</param>
    /// <param name="unsubscribe">The matching event remove accessor.</param>
    /// <returns>This monitor, so multiple events can be registered together.</returns>
    public EventMonitor Watch<TEventArgs>(
        string eventName,
        Action<EventHandler<TEventArgs>> subscribe,
        Action<EventHandler<TEventArgs>> unsubscribe)
        where TEventArgs : EventArgs
    {
        if (subscribe is null)
        {
            throw new ArgumentNullException(nameof(subscribe));
        }

        if (unsubscribe is null)
        {
            throw new ArgumentNullException(nameof(unsubscribe));
        }

        return WatchCore(eventName, capture =>
        {
            EventHandler<TEventArgs> eventHandler = (sender, args) => capture(sender, args);
            return new EventSubscription(() => subscribe(eventHandler), () => unsubscribe(eventHandler));
        });
    }

    /// <summary>Subscribes to an event that uses a custom delegate signature.</summary>
    /// <typeparam name="TDelegate">The event's delegate type.</typeparam>
    /// <param name="eventName">A stable name used by event assertions.</param>
    /// <param name="subscribe">The event add accessor.</param>
    /// <param name="unsubscribe">The matching event remove accessor.</param>
    /// <param name="createHandler">
    /// Creates the event handler and connects its arguments to the supplied capture callback. The callback accepts the
    /// sender and payload as objects so the adapter can support any delegate signature, including delegates without a
    /// sender or event-argument parameter.
    /// </param>
    /// <returns>This monitor, so multiple events can be registered together.</returns>
    public EventMonitor Watch<TDelegate>(
        string eventName,
        Action<TDelegate> subscribe,
        Action<TDelegate> unsubscribe,
        Func<Action<object?, object?>, TDelegate> createHandler)
        where TDelegate : Delegate
    {
        if (subscribe is null)
        {
            throw new ArgumentNullException(nameof(subscribe));
        }

        if (unsubscribe is null)
        {
            throw new ArgumentNullException(nameof(unsubscribe));
        }

        if (createHandler is null)
        {
            throw new ArgumentNullException(nameof(createHandler));
        }

        return WatchCore(eventName, capture =>
        {
            var eventHandler = createHandler(capture);
            if (eventHandler is null)
            {
                throw new InvalidOperationException("The custom event handler factory returned null.");
            }

            return new EventSubscription(() => subscribe(eventHandler), () => unsubscribe(eventHandler));
        });
    }

    /// <summary>Subscribes to an <see cref="INotifyPropertyChanged.PropertyChanged"/> event.</summary>
    /// <param name="subscribe">The property-changed event add accessor.</param>
    /// <param name="unsubscribe">The matching property-changed event remove accessor.</param>
    /// <returns>This monitor, so property changes can be ordered with other watched events.</returns>
    public EventMonitor WatchPropertyChanged(
        Action<PropertyChangedEventHandler> subscribe,
        Action<PropertyChangedEventHandler> unsubscribe)
    {
        if (subscribe is null)
        {
            throw new ArgumentNullException(nameof(subscribe));
        }

        if (unsubscribe is null)
        {
            throw new ArgumentNullException(nameof(unsubscribe));
        }

        return WatchCore(nameof(INotifyPropertyChanged.PropertyChanged), capture =>
        {
            PropertyChangedEventHandler eventHandler = (sender, args) => capture(sender, args);
            return new EventSubscription(() => subscribe(eventHandler), () => unsubscribe(eventHandler));
        });
    }

    /// <summary>Removes every registered handler. Calling this method more than once has no effect.</summary>
    /// <exception cref="AggregateException">One or more event remove accessors failed.</exception>
    public void Dispose()
    {
        Action[] unsubscriptions;
        lock (_gate)
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            unsubscriptions = _unsubscriptions.ToArray();
            _unsubscriptions.Clear();
        }

        List<Exception>? failures = null;
        for (var index = unsubscriptions.Length - 1; index >= 0; index--)
        {
            try
            {
                unsubscriptions[index]();
            }
            catch (Exception exception)
            {
                (failures ??= new List<Exception>()).Add(exception);
            }
        }

        if (failures is not null)
        {
            throw new AggregateException("One or more event handlers could not be removed.", failures);
        }
    }

    internal IReadOnlyList<EventOccurrence> GetEventsFor(string eventName)
    {
        if (eventName is null)
        {
            throw new ArgumentNullException(nameof(eventName));
        }

        lock (_gate)
        {
            if (!_eventRegistrations.ContainsKey(eventName))
            {
                throw new InvalidOperationException($"Event '{eventName}' is not being monitored.");
            }

            var matches = new List<EventOccurrence>();
            foreach (var occurrence in _occurredEvents)
            {
                if (string.Equals(occurrence.EventName, eventName, StringComparison.Ordinal))
                {
                    matches.Add(occurrence);
                }
            }

            return matches.ToArray();
        }
    }

    internal bool IsWatching(string eventName)
    {
        lock (_gate)
        {
            return _eventRegistrations.ContainsKey(eventName);
        }
    }

    private EventMonitor WatchCore(string eventName, Func<Action<object?, object?>, EventSubscription> createSubscription)
    {
        if (string.IsNullOrWhiteSpace(eventName))
        {
            throw new ArgumentException("An event name is required.", nameof(eventName));
        }

        var registration = new object();
        lock (_gate)
        {
            ThrowIfDisposed();
            if (_eventRegistrations.ContainsKey(eventName))
            {
                throw new ArgumentException($"Event '{eventName}' is already being monitored.", nameof(eventName));
            }

            _eventRegistrations.Add(eventName, registration);
        }

        Action<object?, object?> capture = (sender, args) => Record(eventName, registration, sender, args);
        EventSubscription subscription;
        try
        {
            subscription = createSubscription(capture);
        }
        catch
        {
            lock (_gate)
            {
                _eventRegistrations.Remove(eventName);
            }

            throw;
        }

        try
        {
            subscription.Subscribe();
        }
        catch (Exception subscribeFailure)
        {
            lock (_gate)
            {
                _eventRegistrations.Remove(eventName);
            }

            try
            {
                subscription.Unsubscribe();
            }
            catch (Exception unsubscribeFailure)
            {
                bool retryRemoval;
                lock (_gate)
                {
                    retryRemoval = _disposed;
                    if (!retryRemoval)
                    {
                        _unsubscriptions.Add(subscription.Unsubscribe);
                    }
                }

                if (retryRemoval)
                {
                    // Dispose already took its cleanup snapshot; this registration must perform the final attempt.
                    try
                    {
                        subscription.Unsubscribe();
                    }
                    catch (Exception cleanupFailure)
                    {
                        throw new AggregateException("Event subscription failed and its handler could not be removed.",
                            subscribeFailure, unsubscribeFailure, cleanupFailure);
                    }
                }

                throw new AggregateException("Event subscription failed and its handler could not be removed.",
                    subscribeFailure, unsubscribeFailure);
            }

            throw;
        }

        lock (_gate)
        {
            if (!_disposed)
            {
                _unsubscriptions.Add(subscription.Unsubscribe);
                return this;
            }
        }

        // Dispose may race with subscription setup. If so, detach this handler before reporting the race.
        subscription.Unsubscribe();
        throw new ObjectDisposedException(nameof(EventMonitor));
    }

    private void Record(string eventName, object registration, object? sender, object? args)
    {
        lock (_gate)
        {
            if (_disposed
                || !_eventRegistrations.TryGetValue(eventName, out var activeRegistration)
                || !ReferenceEquals(activeRegistration, registration))
            {
                return;
            }

            _occurredEvents.Add(new EventOccurrence(eventName, sender, args, _occurredEvents.Count + 1));
        }
    }

    private void ThrowIfDisposed()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(EventMonitor));
        }
    }

    private sealed class EventSubscription
    {
        public EventSubscription(Action subscribe, Action unsubscribe)
        {
            Subscribe = subscribe;
            Unsubscribe = unsubscribe;
        }

        public Action Subscribe { get; }
        public Action Unsubscribe { get; }
    }
}

/// <summary>A captured event notification with its name, sender, arguments, and sequence number.</summary>
public sealed class EventOccurrence
{
    internal EventOccurrence(string eventName, object? sender, object? payload, int sequence)
    {
        EventName = eventName;
        Sender = sender;
        Arguments = payload as EventArgs;
        Payload = payload;
        Sequence = sequence;
    }

    /// <summary>Gets the name supplied when this event was registered.</summary>
    public string EventName { get; }

    /// <summary>Gets the sender supplied by the event source.</summary>
    public object? Sender { get; }

    /// <summary>Gets the event arguments supplied by the event source.</summary>
    public EventArgs? Arguments { get; }

    /// <summary>
    /// Gets the payload supplied by the event source. This is the same object as <see cref="Arguments"/> when the
    /// payload derives from <see cref="EventArgs"/>; custom delegate payloads are available here without conversion.
    /// </summary>
    public object? Payload { get; }

    /// <summary>Gets this occurrence's one-based position in the monitor's captured event sequence.</summary>
    public int Sequence { get; }
}

/// <summary>Assertions over events captured by an <see cref="EventMonitor"/>.</summary>
public sealed class EventMonitorAssertions
{
    private readonly EventMonitor _monitor;
    private const string PropertyChangedEventName = nameof(INotifyPropertyChanged.PropertyChanged);

    internal EventMonitorAssertions(EventMonitor monitor) => _monitor = monitor;

    /// <summary>Asserts that the named event was raised at least once.</summary>
    public EventMonitorAssertions Raise(string eventName)
    {
        var occurrences = _monitor.GetEventsFor(eventName);
        if (occurrences.Count == 0)
        {
            AssertionFailure.Fail($"Expected event '{eventName}' to be raised, but it was not.");
        }

        return this;
    }

    /// <summary>Asserts that the named event was not raised.</summary>
    public EventMonitorAssertions NotRaise(string eventName)
    {
        var occurrences = _monitor.GetEventsFor(eventName);
        if (occurrences.Count != 0)
        {
            AssertionFailure.Fail($"Expected event '{eventName}' not to be raised, but it was raised {occurrences.Count} time(s).");
        }

        return this;
    }

    /// <summary>Asserts the exact number of times the named event was raised.</summary>
    public EventMonitorAssertions RaiseTimes(string eventName, int expectedCount)
    {
        if (expectedCount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expectedCount), "The expected event count cannot be negative.");
        }

        var actualCount = _monitor.GetEventsFor(eventName).Count;
        if (actualCount != expectedCount)
        {
            AssertionFailure.Fail($"Expected event '{eventName}' to be raised {expectedCount} time(s), but it was raised {actualCount} time(s).");
        }

        return this;
    }

    /// <summary>Asserts that at least one property-changed notification was raised.</summary>
    public EventMonitorAssertions RaisePropertyChange()
    {
        var occurrences = _monitor.GetEventsFor(PropertyChangedEventName);
        if (!HasPropertyChangedArguments(occurrences))
        {
            AssertionFailure.Fail("Expected a property-changed notification, but none was observed.");
        }

        return this;
    }

    /// <summary>Asserts that no property-changed notification was raised.</summary>
    public EventMonitorAssertions NotRaisePropertyChange()
    {
        var occurrences = _monitor.GetEventsFor(PropertyChangedEventName);
        if (HasPropertyChangedArguments(occurrences))
        {
            AssertionFailure.Fail("Expected no property-changed notification, but one was observed.");
        }

        return this;
    }

    /// <summary>Asserts that a property-changed notification targets the named property.</summary>
    /// <param name="propertyName">The property name, compared ordinally.</param>
    public EventMonitorAssertions RaisePropertyChangeFor(string propertyName)
    {
        ValidatePropertyName(propertyName);
        var occurrences = _monitor.GetEventsFor(PropertyChangedEventName);
        if (!AffectsProperty(occurrences, propertyName))
        {
            AssertionFailure.Fail("Expected a property-changed notification for the requested property, but none was observed.");
        }

        return this;
    }

    /// <summary>Asserts that no property-changed notification targets the named property.</summary>
    /// <param name="propertyName">The property name, compared ordinally.</param>
    public EventMonitorAssertions NotRaisePropertyChangeFor(string propertyName)
    {
        ValidatePropertyName(propertyName);
        var occurrences = _monitor.GetEventsFor(PropertyChangedEventName);
        if (AffectsProperty(occurrences, propertyName))
        {
            AssertionFailure.Fail("Expected no property-changed notification for the requested property, but one was observed.");
        }

        return this;
    }

    /// <summary>Asserts that all captured monitored events exactly match the supplied order.</summary>
    /// <param name="eventNames">Expected event names in occurrence order.</param>
    public EventMonitorAssertions RaiseInOrder(params string[] eventNames)
    {
        if (eventNames is null)
        {
            throw new ArgumentNullException(nameof(eventNames));
        }

        for (var index = 0; index < eventNames.Length; index++)
        {
            var expectedName = eventNames[index];
            if (expectedName is null)
            {
                throw new ArgumentException("Expected event names cannot contain null entries.", nameof(eventNames));
            }

            if (!_monitor.IsWatching(expectedName))
            {
                throw new InvalidOperationException($"Event '{expectedName}' is not being monitored.");
            }
        }

        var occurred = _monitor.OccurredEvents;
        if (occurred.Count != eventNames.Length)
        {
            AssertionFailure.Fail($"Expected {eventNames.Length} monitored event(s) in the requested order, but observed {occurred.Count}.");
        }

        for (var index = 0; index < eventNames.Length; index++)
        {
            var expectedName = eventNames[index];
            if (!string.Equals(occurred[index].EventName, expectedName, StringComparison.Ordinal))
            {
                AssertionFailure.Fail($"Expected monitored event {index + 1} to be '{expectedName}', but it was '{occurred[index].EventName}'.");
            }
        }

        return this;
    }

    private static bool HasPropertyChangedArguments(IReadOnlyList<EventOccurrence> occurrences)
    {
        foreach (var occurrence in occurrences)
        {
            if (occurrence.Arguments is PropertyChangedEventArgs)
            {
                return true;
            }
        }

        return false;
    }

    private static bool AffectsProperty(IReadOnlyList<EventOccurrence> occurrences, string propertyName)
    {
        foreach (var occurrence in occurrences)
        {
            if (occurrence.Arguments is PropertyChangedEventArgs args
                && (string.IsNullOrEmpty(args.PropertyName)
                    || string.Equals(args.PropertyName, propertyName, StringComparison.Ordinal)))
            {
                return true;
            }
        }

        return false;
    }

    private static void ValidatePropertyName(string propertyName)
    {
        if (string.IsNullOrWhiteSpace(propertyName))
        {
            throw new ArgumentException("A property name is required.", nameof(propertyName));
        }
    }
}
