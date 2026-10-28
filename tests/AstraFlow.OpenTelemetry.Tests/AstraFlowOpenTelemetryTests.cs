using System.Diagnostics;
using System.Diagnostics.Metrics;
using AstraFlow.Mediator;
using AstraFlow.OpenTelemetry;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace AstraFlow.OpenTelemetry.Tests;

public sealed class AstraFlowOpenTelemetryTests
{
    [Fact]
    public async Task RequestBehavior_EmitsActivityAndDurationMetricWithoutPayloadTags()
    {
        using var collector = new ActivityCollector();
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.RequestDurationMetric);
        using var telemetry = CreateTelemetry();
        var behavior = new AstraFlowRequestTelemetryBehavior<Ping, Pong>(telemetry);

        await behavior.Handle(
            new Ping("secret-payload"),
            () => Task.FromResult(new Pong("ok")),
            CancellationToken.None);

        collector.Activities.Should().ContainSingle(activity => activity.OperationName == AstraFlowTelemetryNames.RequestActivity);
        collector.Activities.Single().Tags.Should().NotContain(tag => tag.Value == "secret-payload");
        meterCollector.Measurements.Should().Contain(value => value >= 0);
    }

    [Fact]
    public async Task RequestBehavior_DisableSwitchSuppressesActivityAndMetrics()
    {
        using var collector = new ActivityCollector();
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.RequestDurationMetric);
        using var telemetry = CreateTelemetry(options => options.Enabled = false);
        var behavior = new AstraFlowRequestTelemetryBehavior<Ping, Pong>(telemetry);

        await behavior.Handle(
            new Ping("secret-payload"),
            () => Task.FromResult(new Pong("ok")),
            CancellationToken.None);

        collector.Activities.Should().BeEmpty();
        meterCollector.Measurements.Should().BeEmpty();
    }

    [Fact]
    public async Task RequestBehavior_SamplingCanSkipTracingWhileKeepingMetrics()
    {
        using var collector = new ActivityCollector();
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.RequestDurationMetric);
        using var telemetry = CreateTelemetry(options => options.ShouldTraceOperation = _ => false);
        var behavior = new AstraFlowRequestTelemetryBehavior<Ping, Pong>(telemetry);

        await behavior.Handle(
            new Ping("secret-payload"),
            () => Task.FromResult(new Pong("ok")),
            CancellationToken.None);

        collector.Activities.Should().BeEmpty();
        meterCollector.Measurements.Should().Contain(value => value >= 0);
    }

    [Fact]
    public async Task RequestBehavior_RecordsFailureMetric()
    {
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.RequestFailureMetric);
        using var telemetry = CreateTelemetry(options => options.IncludeExceptionTypeNames = false);
        var behavior = new AstraFlowRequestTelemetryBehavior<Ping, Pong>(telemetry);

        var act = () => behavior.Handle(
            new Ping("secret-payload"),
            () => throw new InvalidOperationException("boom"),
            CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
        meterCollector.Count.Should().Be(1);
    }

    [Fact]
    public async Task VoidRequestBehavior_EmitsActivity()
    {
        using var collector = new ActivityCollector();
        using var telemetry = CreateTelemetry();
        var behavior = new AstraFlowVoidRequestTelemetryBehavior<VoidPing>(telemetry);

        await behavior.Handle(new VoidPing(), () => Task.CompletedTask, CancellationToken.None);

        collector.Activities.Should().ContainSingle(activity => activity.OperationName == AstraFlowTelemetryNames.VoidRequestActivity);
    }

    [Fact]
    public async Task Publisher_EmitsNotificationActivityAndDurationMetric()
    {
        using var collector = new ActivityCollector();
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.NotificationDurationMetric);
        using var telemetry = CreateTelemetry();
        var publisher = new AstraFlowTelemetryPublisher(new TestMediator(), telemetry);

        await publisher.Publish(new OrderCreated(), CancellationToken.None);

        collector.Activities.Should().ContainSingle(activity => activity.OperationName == AstraFlowTelemetryNames.NotificationActivity);
        meterCollector.Measurements.Should().Contain(value => value >= 0);
    }

    [Fact]
    public void ValidationFindingMetric_RecordsCounts()
    {
        using var meterCollector = new MeterCollector(AstraFlowTelemetryNames.ValidationFindingMetric);
        using var telemetry = CreateTelemetry();

        telemetry.RecordValidationFindings(3);

        meterCollector.Count.Should().Be(3);
    }

    [Fact]
    public void DefaultRedactor_UsesSharedSensitiveNamePolicy()
    {
        var redactor = new AstraFlowDefaultTelemetryRedactor();

        redactor.Redact("access.token", "secret-value").Should().Be("[redacted]");
        redactor.Redact("astraflow.operation.type", typeof(Ping).FullName!).Should().Be(typeof(Ping).FullName);
    }

    [Fact]
    public void Registration_AddsBehaviorsTelemetryAndPublisherWrapper()
    {
        var services = new ServiceCollection();

        services.AddAstraFlowOpenTelemetry(options => options.IncludeOperationTypeNames = true);

        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(AstraFlowTelemetry));
        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(IPipelineBehavior<,>));
        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(IRequestPipelineBehavior<>));
        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(IPublisher));
        using var provider = services.BuildServiceProvider();
        provider.GetRequiredService<IOptions<AstraFlowTelemetryOptions>>()
            .Value
            .IncludeOperationTypeNames
            .Should()
            .BeTrue();
    }

    private static AstraFlowTelemetry CreateTelemetry(Action<AstraFlowTelemetryOptions>? configure = null)
    {
        var options = new AstraFlowTelemetryOptions();
        configure?.Invoke(options);
        return new AstraFlowTelemetry(Options.Create(options), new AstraFlowDefaultTelemetryRedactor());
    }

    private sealed record Ping(string Value) : IRequest<Pong>;

    private sealed record Pong(string Value);

    private sealed record VoidPing : IRequest;

    private sealed record OrderCreated : INotification;

    private sealed class TestMediator : IMediator
    {
        public Task Send(IRequest request, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public Task<object?> Send(object request, CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public Task Publish<TNotification>(
            TNotification notification,
            CancellationToken cancellationToken = default)
            where TNotification : INotification
        {
            return Task.CompletedTask;
        }

        public Task Publish(object notification, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class ActivityCollector : IDisposable
    {
        private readonly ActivityListener listener = new();

        public ActivityCollector()
        {
            listener.ShouldListenTo = source => source.Name == AstraFlowTelemetryNames.ActivitySourceName;
            listener.Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded;
            listener.ActivityStopped = activity => Activities.Add(activity);
            ActivitySource.AddActivityListener(listener);
        }

        public List<Activity> Activities { get; } = [];

        public void Dispose()
        {
            listener.Dispose();
        }
    }

    private sealed class MeterCollector : IDisposable
    {
        private readonly MeterListener listener = new();

        public MeterCollector(string instrumentName)
        {
            listener.InstrumentPublished = (instrument, meterListener) =>
            {
                if (instrument.Meter.Name == AstraFlowTelemetryNames.MeterName &&
                    instrument.Name == instrumentName)
                {
                    meterListener.EnableMeasurementEvents(instrument);
                }
            };
            listener.SetMeasurementEventCallback<double>((_, measurement, _, _) => Measurements.Add(measurement));
            listener.SetMeasurementEventCallback<long>((_, measurement, _, _) => Count += measurement);
            listener.Start();
        }

        public List<double> Measurements { get; } = [];

        public long Count { get; private set; }

        public void Dispose()
        {
            listener.Dispose();
        }
    }
}
