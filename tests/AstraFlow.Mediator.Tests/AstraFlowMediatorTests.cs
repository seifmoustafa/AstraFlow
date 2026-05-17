using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using System.Runtime.CompilerServices;
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
    public async Task Send_WithRuntimeRequest_DispatchesRequest()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var response = await sender.Send((object)new PingRequest("runtime"));

        response.Should().Be("handled:runtime");
    }

    [Fact]
    public async Task Send_WithVoidRequest_DispatchesWithoutResponse()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        await sender.Send(new VoidPingRequest("void"));

        log.Items.Should().Contain("void-handler:void");
    }

    [Fact]
    public async Task Send_WithRuntimeVoidRequest_ReturnsNull()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var response = await sender.Send((object)new VoidPingRequest("runtime-void"));

        response.Should().BeNull();
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
    public async Task Send_WithMissingVoidHandler_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send(new MissingVoidRequest());

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*No void request handler registered*MissingVoidRequest*");
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
    public async Task Send_WithMultipleVoidHandlers_FailsClearly()
    {
        var services = CreateServices();
        services.AddScoped<IRequestHandler<VoidPingRequest>, VoidPingRequestHandler>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send(new VoidPingRequest("duplicate-void"));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Multiple void request handlers registered*VoidPingRequest*");
    }

    [Fact]
    public async Task Send_WithMultipleRequestContracts_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send<string>(new AmbiguousRequest("ambiguous"));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*AmbiguousRequest*implements multiple AstraFlow request contracts*");
    }

    [Fact]
    public async Task Send_WithRuntimeRequestAndMultipleRequestContracts_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send((object)new AmbiguousRequest("ambiguous"));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*AmbiguousRequest*implements multiple AstraFlow request contracts*");
    }

    [Fact]
    public void AddAstraFlowMediator_WithNullServices_FailsClearly()
    {
        IServiceCollection services = null!;

        var act = () => services.AddAstraFlowMediator(typeof(AstraFlowMediatorTests));

        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public async Task AddAstraFlowMediator_WithNullMarkerType_IgnoresMarker()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ExecutionLog>();

        services.AddAstraFlowMediator(typeof(AstraFlowMediatorTests), null!);

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var response = await sender.Send(new PingRequest("null-marker"));

        response.Should().Be("handled:null-marker");
    }

    [Fact]
    public void AddAstraFlowMediator_WithCoverageValidationAndMultipleRequestContracts_FailsClearly()
    {
        var services = new ServiceCollection();

        var act = () => services.AddAstraFlowMediator(
            validateRequestCoverage: true,
            assemblyMarkerTypes: typeof(AstraFlowMediatorTests));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*coverage validation failed*Ambiguous request contracts*AmbiguousRequest*");
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
    public async Task Send_WithVoidPipeline_RunsInRegistrationOrder()
    {
        var services = CreateServices();
        services.AddScoped<IRequestPipelineBehavior<VoidPingRequest>, FirstVoidBehavior>();
        services.AddScoped<IRequestPipelineBehavior<VoidPingRequest>, SecondVoidBehavior>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        await sender.Send(new VoidPingRequest("void-order"));

        log.Items.Should().Equal(
            "void-first:before",
            "void-second:before",
            "void-handler:void-order",
            "void-second:after",
            "void-first:after");
    }

    [Fact]
    public async Task Send_WithPreAndPostProcessors_RunsAroundResponsePipeline()
    {
        var services = CreateServices();
        services.AddScoped<IRequestPreProcessor<PingRequest>, PingPreProcessor>();
        services.AddScoped<IRequestPostProcessor<PingRequest, string>, PingPostProcessor>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var response = await sender.Send(new PingRequest("processors"));

        response.Should().Be("handled:processors");
        log.Items.Should().Equal("pre:processors", "handler", "post:handled:processors");
    }

    [Fact]
    public async Task Send_WithExceptionAction_RethrowsOriginalFailure()
    {
        var services = CreateServices();
        services.AddScoped<IRequestExceptionAction<ThrowingRequest, string, InvalidOperationException>, ThrowingRequestExceptionAction>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var act = () => sender.Send(new ThrowingRequest("action"));

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("boom:action");
        log.Items.Should().Equal("exception-action:boom:action");
    }

    [Fact]
    public async Task Send_WithExceptionHandler_ReturnsHandledResponse()
    {
        var services = CreateServices();
        services.AddScoped<IRequestExceptionHandler<ThrowingRequest, string, InvalidOperationException>, ThrowingRequestExceptionHandler>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var response = await sender.Send(new ThrowingRequest("handled"));

        response.Should().Be("recovered:handled");
    }

    [Fact]
    public async Task Send_WithVoidExceptionAction_RethrowsOriginalFailure()
    {
        var services = CreateServices();
        services.AddScoped<IRequestExceptionAction<ThrowingVoidRequest, InvalidOperationException>, ThrowingVoidExceptionAction>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var act = () => sender.Send(new ThrowingVoidRequest("void-action"));

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("void-boom:void-action");
        log.Items.Should().Equal("void-exception-action:void-boom:void-action");
    }

    [Fact]
    public async Task Send_WithVoidExceptionHandler_CompletesWhenHandled()
    {
        var services = CreateServices();
        services.AddScoped<IRequestExceptionHandler<ThrowingVoidRequest, InvalidOperationException>, ThrowingVoidExceptionHandler>();

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        await sender.Send(new ThrowingVoidRequest("void-handled"));

        log.Items.Should().Equal("void-exception-handled:void-handled");
    }

    [Fact]
    public async Task CreateStream_WithRegisteredHandler_DispatchesStreamThroughBehavior()
    {
        var services = CreateServices();
        services.AddScoped<IStreamPipelineBehavior<CountStreamRequest, int>, CountStreamBehavior>();

        using var provider = services.BuildServiceProvider();
        var streamSender = provider.GetRequiredService<IStreamSender>();
        var log = provider.GetRequiredService<ExecutionLog>();

        var values = new List<int>();
        await foreach (var value in streamSender.CreateStream(new CountStreamRequest(3)))
            values.Add(value);

        values.Should().Equal(10, 11, 12);
        log.Items.Should().Equal("stream:before", "stream:after");
    }

    [Fact]
    public async Task CreateStream_WithRuntimeRequest_BoxesStreamItems()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var streamSender = provider.GetRequiredService<IStreamSender>();

        var values = new List<object?>();
        await foreach (var value in streamSender.CreateStream((object)new CountStreamRequest(2)))
            values.Add(value);

        values.Should().Equal(0, 1);
    }

    [Fact]
    public async Task CreateStream_WithoutRegisteredHandler_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var streamSender = provider.GetRequiredService<IStreamSender>();

        var act = () => streamSender.CreateStream(new MissingStreamRequest());

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*No stream request handler registered*MissingStreamRequest*");
        await Task.CompletedTask;
    }

    [Fact]
    public async Task CreateStream_WithMultipleHandlers_FailsClearly()
    {
        var services = CreateServices();
        services.AddScoped<IStreamRequestHandler<CountStreamRequest, int>, CountStreamRequestHandler>();

        using var provider = services.BuildServiceProvider();
        var streamSender = provider.GetRequiredService<IStreamSender>();

        var act = () => streamSender.CreateStream(new CountStreamRequest(1));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*Multiple stream request handlers registered*CountStreamRequest*");
        await Task.CompletedTask;
    }

    [Fact]
    public async Task CreateStream_WithCancellation_StopsEnumeration()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var streamSender = provider.GetRequiredService<IStreamSender>();
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        var stream = streamSender.CreateStream(new CountStreamRequest(3), cancellation.Token);
        var act = async () =>
        {
            await foreach (var _ in stream.WithCancellation(cancellation.Token))
            {
            }
        };

        await act.Should().ThrowAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task Send_WithStreamRequest_FailsClearly()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var act = () => sender.Send((object)new CountStreamRequest(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Stream request*CountStreamRequest*CreateStream*");
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

    [Fact]
    public async Task Publish_WithBoundedParallelAggregatePolicy_RunsAllHandlersThenThrowsAggregate()
    {
        var services = CreateServices(NotificationFailurePolicy.Aggregate, NotificationPublishStrategy.BoundedParallel);

        using var provider = services.BuildServiceProvider();
        var publisher = provider.GetRequiredService<IPublisher>();

        var act = () => publisher.Publish(new FailurePolicyNotification());

        await act.Should().ThrowAsync<AggregateException>();
    }

    private static ServiceCollection CreateServices(
        NotificationFailurePolicy failurePolicy = NotificationFailurePolicy.FailFast,
        NotificationPublishStrategy publishStrategy = NotificationPublishStrategy.Sequential)
    {
        var services = new ServiceCollection();
        services.AddSingleton<ExecutionLog>();
        services.Configure<NotificationPublishOptions>(options =>
        {
            options.FailurePolicy = failurePolicy;
            options.PublishStrategy = publishStrategy;
            options.MaxDegreeOfParallelism = 2;
        });
        services.AddAstraFlowMediator(typeof(AstraFlowMediatorTests));
        return services;
    }

    public sealed record PingRequest(string Message) : IRequest<string>;

    public sealed record VoidPingRequest(string Message) : IRequest;

    public sealed record MissingVoidRequest : IRequest;

    public sealed record ThrowingVoidRequest(string Message) : IRequest;

    public sealed record CountStreamRequest(int Count) : IStreamRequest<int>;

    public sealed record MissingStreamRequest : IStreamRequest<int>;

    public sealed record ThrowingRequest(string Message) : IRequest<string>;

    public sealed record AmbiguousRequest(string Message) : IRequest<string>, IRequest<int>;

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

    public sealed class VoidPingRequestHandler(ExecutionLog log) : IRequestHandler<VoidPingRequest>
    {
        public Task Handle(VoidPingRequest request, CancellationToken cancellationToken)
        {
            log.Items.Add($"void-handler:{request.Message}");
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingVoidRequestHandler : IRequestHandler<ThrowingVoidRequest>
    {
        public Task Handle(ThrowingVoidRequest request, CancellationToken cancellationToken)
        {
            throw new InvalidOperationException($"void-boom:{request.Message}");
        }
    }

    public sealed class CountStreamRequestHandler : IStreamRequestHandler<CountStreamRequest, int>
    {
        public async IAsyncEnumerable<int> Handle(
            CountStreamRequest request,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            for (var i = 0; i < request.Count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await Task.Yield();
                yield return i;
            }
        }
    }

    public sealed class ThrowingRequestHandler : IRequestHandler<ThrowingRequest, string>
    {
        public Task<string> Handle(ThrowingRequest request, CancellationToken cancellationToken)
        {
            throw new InvalidOperationException($"boom:{request.Message}");
        }
    }

    public sealed class AmbiguousStringHandler : IRequestHandler<AmbiguousRequest, string>
    {
        public Task<string> Handle(AmbiguousRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult(request.Message);
        }
    }

    public sealed class AmbiguousIntHandler : IRequestHandler<AmbiguousRequest, int>
    {
        public Task<int> Handle(AmbiguousRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult(request.Message.Length);
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

    public abstract class VoidMarkerBehavior(string name, ExecutionLog log)
        : IRequestPipelineBehavior<VoidPingRequest>
    {
        public async Task Handle(
            VoidPingRequest request,
            RequestHandlerDelegate next,
            CancellationToken cancellationToken)
        {
            log.Items.Add($"{name}:before");
            await next();
            log.Items.Add($"{name}:after");
        }
    }

    public sealed class FirstVoidBehavior(ExecutionLog log) : VoidMarkerBehavior("void-first", log);

    public sealed class SecondVoidBehavior(ExecutionLog log) : VoidMarkerBehavior("void-second", log);

    public sealed class PingPreProcessor(ExecutionLog log) : IRequestPreProcessor<PingRequest>
    {
        public Task Process(PingRequest request, CancellationToken cancellationToken)
        {
            log.Items.Add($"pre:{request.Message}");
            return Task.CompletedTask;
        }
    }

    public sealed class PingPostProcessor(ExecutionLog log) : IRequestPostProcessor<PingRequest, string>
    {
        public Task Process(PingRequest request, string response, CancellationToken cancellationToken)
        {
            log.Items.Add($"post:{response}");
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingRequestExceptionAction(ExecutionLog log)
        : IRequestExceptionAction<ThrowingRequest, string, InvalidOperationException>
    {
        public Task Execute(ThrowingRequest request, InvalidOperationException exception, CancellationToken cancellationToken)
        {
            log.Items.Add($"exception-action:{exception.Message}");
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingRequestExceptionHandler
        : IRequestExceptionHandler<ThrowingRequest, string, InvalidOperationException>
    {
        public Task Handle(
            ThrowingRequest request,
            InvalidOperationException exception,
            RequestExceptionHandlerState<string> state,
            CancellationToken cancellationToken)
        {
            state.SetHandled($"recovered:{request.Message}");
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingVoidExceptionAction(ExecutionLog log)
        : IRequestExceptionAction<ThrowingVoidRequest, InvalidOperationException>
    {
        public Task Execute(ThrowingVoidRequest request, InvalidOperationException exception, CancellationToken cancellationToken)
        {
            log.Items.Add($"void-exception-action:{exception.Message}");
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingVoidExceptionHandler(ExecutionLog log)
        : IRequestExceptionHandler<ThrowingVoidRequest, InvalidOperationException>
    {
        public Task Handle(
            ThrowingVoidRequest request,
            InvalidOperationException exception,
            RequestExceptionHandlerState state,
            CancellationToken cancellationToken)
        {
            log.Items.Add($"void-exception-handled:{request.Message}");
            state.SetHandled();
            return Task.CompletedTask;
        }
    }

    public sealed class CountStreamBehavior(ExecutionLog log)
        : IStreamPipelineBehavior<CountStreamRequest, int>
    {
        public async IAsyncEnumerable<int> Handle(
            CountStreamRequest request,
            StreamHandlerDelegate<int> next,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            log.Items.Add("stream:before");
            await foreach (var value in next().WithCancellation(cancellationToken))
                yield return value + 10;
            log.Items.Add("stream:after");
        }
    }
}
