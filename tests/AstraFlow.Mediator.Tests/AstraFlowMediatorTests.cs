using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Mediator.Tests;

public sealed class AstraFlowMediatorTests
{
    [Fact]
    public async Task Send_WithRegisteredHandler_DispatchesRequest()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var response = await sender.Send(new PingRequest("hello"));

        response.Should().Be("handled:hello");
    }

    [Fact]
    public async Task Send_WithoutRegisteredHandler_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send(new MissingHandlerRequest());

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*No request handler registered*MissingHandlerRequest*");
    }

    [Fact]
    public async Task Send_WithMultipleHandlers_FailsClearly()
    {
        var services = CreateServices();
        services.AddScoped<IRequestHandler<PingRequest, string>, PingRequestHandler>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send(new PingRequest("duplicate"));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Multiple request handlers registered*PingRequest*");
    }

    [Fact]
    public async Task Send_RunsPipelineInRegistrationOrder()
    {
        var services = CreateServices();
        services.AddScoped<IPipelineBehavior<PingRequest, string>, FirstBehavior>();
        services.AddScoped<IPipelineBehavior<PingRequest, string>, SecondBehavior>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var response = await sender.Send(new PingRequest("order"));

        response.Should().Be("handled:order");
        log.Items.Should().Equal(
            "first:before",
            "second:before",
            "handler",
            "second:after",
            "first:after");
    }

    [Fact]
    public async Task Send_WhenBehaviorShortCircuits_DoesNotCallHandler()
    {
        var services = CreateServices();
        services.AddScoped<IPipelineBehavior<PingRequest, string>, ShortCircuitBehavior>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var response = await sender.Send(new PingRequest("blocked"));

        response.Should().Be("blocked");
        log.Items.Should().Equal("short-circuit");
    }

    [Fact]
    public async Task Publish_WithMultipleHandlers_RunsSequentially()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var publisher = provider.GetRequiredService<IPublisher>();
        var log = provider.GetRequiredService<ExecutionLog>();

        await publisher.Publish(new PingNotification());

        log.Items.Should().Equal("notification:one", "notification:two");
    }

    [Fact]
    public async Task Publish_WithContinuePolicy_RunsRemainingHandlersAfterFailure()
    {
        var services = CreateServices(NotificationFailurePolicy.Continue);

        using var provider = services.BuildServiceProvider();
        var publisher = provider.GetRequiredService<IPublisher>();
        var log = provider.GetRequiredService<ExecutionLog>();

        await publisher.Publish(new FailurePolicyNotification());

        log.Items.Should().ContainInOrder("notification:failing", "notification:after-failure");
    }

    [Fact]
    public async Task Publish_WithAggregatePolicy_RunsAllHandlersThenThrowsAggregate()
    {
        var services = CreateServices(NotificationFailurePolicy.Aggregate);

        using var provider = services.BuildServiceProvider();
        var publisher = provider.GetRequiredService<IPublisher>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var act = () => publisher.Publish(new FailurePolicyNotification());

        await act.Should().ThrowAsync<AggregateException>();
        log.Items.Should().ContainInOrder("notification:failing", "notification:after-failure");
    }

    private static ServiceCollection CreateServices(
        NotificationFailurePolicy failurePolicy = NotificationFailurePolicy.FailFast)
    {
        var services = new ServiceCollection();
        services.AddSingleton<ExecutionLog>();
        services.Configure<NotificationPublishOptions>(options =>
        {
            options.FailurePolicy = failurePolicy;
        });
        services.AddAstraFlowMediator(typeof(AstraFlowMediatorTests));
        return services;
    }

    public sealed record PingRequest(string Message) : IRequest<string>;

    public sealed record MissingHandlerRequest : IRequest<string>;

    public sealed record PingNotification : INotification;

    public sealed record FailurePolicyNotification : INotification;

    public sealed class PingRequestHandler(ExecutionLog log) : IRequestHandler<PingRequest, string>
    {
        public Task<string> Handle(PingRequest request, CancellationToken cancellationToken)
        {
            log.Items.Add("handler");
            return Task.FromResult($"handled:{request.Message}");
        }
    }

    public sealed class FirstNotificationHandler(ExecutionLog log) : INotificationHandler<PingNotification>
    {
        public Task Handle(PingNotification notification, CancellationToken cancellationToken)
        {
            log.Items.Add("notification:one");
            return Task.CompletedTask;
        }
    }

    public sealed class SecondNotificationHandler(ExecutionLog log) : INotificationHandler<PingNotification>
    {
        public Task Handle(PingNotification notification, CancellationToken cancellationToken)
        {
            log.Items.Add("notification:two");
            return Task.CompletedTask;
        }
    }

    public sealed class FailingNotificationHandler(ExecutionLog log)
        : INotificationHandler<FailurePolicyNotification>
    {
        public Task Handle(FailurePolicyNotification notification, CancellationToken cancellationToken)
        {
            log.Items.Add("notification:failing");
            throw new InvalidOperationException("notification failed");
        }
    }

    public sealed class AfterFailingNotificationHandler(ExecutionLog log)
        : INotificationHandler<FailurePolicyNotification>
    {
        public Task Handle(FailurePolicyNotification notification, CancellationToken cancellationToken)
        {
            log.Items.Add("notification:after-failure");
            return Task.CompletedTask;
        }
    }

    public sealed class ExecutionLog
    {
        public List<string> Items { get; } = [];
    }

    public abstract class MarkerBehavior(string name, ExecutionLog log)
        : IPipelineBehavior<PingRequest, string>
    {
        public async Task<string> Handle(
            PingRequest request,
            RequestHandlerDelegate<string> next,
            CancellationToken cancellationToken)
        {
            log.Items.Add($"{name}:before");
            var response = await next();
            log.Items.Add($"{name}:after");
            return response;
        }
    }

    public sealed class FirstBehavior(ExecutionLog log) : MarkerBehavior("first", log);

    public sealed class SecondBehavior(ExecutionLog log) : MarkerBehavior("second", log);

    public sealed class ShortCircuitBehavior(ExecutionLog log) : IPipelineBehavior<PingRequest, string>
    {
        public Task<string> Handle(
            PingRequest request,
            RequestHandlerDelegate<string> next,
            CancellationToken cancellationToken)
        {
            log.Items.Add("short-circuit");
            return Task.FromResult("blocked");
        }
    }
}
