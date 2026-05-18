using System.Linq.Expressions;
using AstraFlow.Diagnostics;
using AstraFlow.Mapper;
using AstraFlow.Mediator;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Diagnostics.Tests;

public sealed class AstraFlowDiagnosticsTests
{
    [Fact]
    public void CreateReport_WithRegisteredServices_ReportsCountsAndInfoFinding()
    {
        var services = CreateBaseServices();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Summary.RequestHandlerCount.Should().Be(1);
        report.Summary.NotificationHandlerCount.Should().Be(1);
        report.Summary.PipelineBehaviorCount.Should().Be(7);
        report.Summary.MappingRuleCount.Should().Be(1);
        report.Summary.ProjectionCount.Should().Be(1);
        report.Summary.HasErrors.Should().BeFalse();
        report.Findings.Should().Contain(f => f.Code == "AFD000" && f.Severity == DiagnosticSeverity.Info);
    }

    [Fact]
    public void CreateReport_WithMediatorCrossCuttingRegistrations_ReportsTypesWithoutPayloadValues()
    {
        var services = CreateBaseServices();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();
        var markdown = reporter.CreateMarkdownReport();

        report.PipelineBehaviors.Should().Contain(r => r.Category == "Request pre-processor");
        report.PipelineBehaviors.Should().Contain(r => r.Category == "Response request post-processor");
        report.PipelineBehaviors.Should().Contain(r => r.Category == "Response request exception action");
        report.PipelineBehaviors.Should().Contain(r => r.Category == "Response request exception handler");
        report.NotificationHandlers.Should().Contain(r => r.ImplementationType!.Contains(nameof(PingNotificationHandler), StringComparison.Ordinal));
        markdown.Should().NotContain("secret-payload-value");
    }

    [Fact]
    public void CreateReport_WithOrderSensitiveMediatorRegistrations_PreservesDependencyInjectionOrder()
    {
        var services = new ServiceCollection();
        services.AddScoped<INotificationHandler<PingNotification>, ZFirstNotificationHandler>();
        services.AddScoped<INotificationHandler<PingNotification>, ASecondNotificationHandler>();
        services.AddScoped<IRequestPreProcessor<PingRequest>, ZFirstPreProcessor>();
        services.AddScoped<IRequestPreProcessor<PingRequest>, ASecondPreProcessor>();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();
        var markdown = reporter.CreateMarkdownReport();
        var notificationImplementations = report.NotificationHandlers.Select(r => r.ImplementationType).ToArray();
        var pipelineImplementations = report.PipelineBehaviors.Select(r => r.ImplementationType).ToArray();

        notificationImplementations.Should().HaveCount(2);
        notificationImplementations[0].Should().Contain(nameof(ZFirstNotificationHandler));
        notificationImplementations[1].Should().Contain(nameof(ASecondNotificationHandler));
        pipelineImplementations.Should().HaveCount(2);
        pipelineImplementations[0].Should().Contain(nameof(ZFirstPreProcessor));
        pipelineImplementations[1].Should().Contain(nameof(ASecondPreProcessor));
        markdown.IndexOf(nameof(ZFirstNotificationHandler), StringComparison.Ordinal)
            .Should().BeLessThan(markdown.IndexOf(nameof(ASecondNotificationHandler), StringComparison.Ordinal));
        markdown.IndexOf(nameof(ZFirstPreProcessor), StringComparison.Ordinal)
            .Should().BeLessThan(markdown.IndexOf(nameof(ASecondPreProcessor), StringComparison.Ordinal));
    }

    [Fact]
    public void CreateReport_WithDuplicateRequestHandlers_ReportsError()
    {
        var services = CreateBaseServices();
        services.AddScoped<IRequestHandler<PingRequest, string>, DuplicatePingHandler>();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Summary.HasErrors.Should().BeTrue();
        report.Findings.Should().Contain(f =>
            f.Code == "AFD101" &&
            f.Severity == DiagnosticSeverity.Error &&
            f.Message.Contains(nameof(PingRequest), StringComparison.Ordinal));
    }

    [Fact]
    public void CreateReport_WithMissingRequestHandler_ReportsError()
    {
        var services = CreateBaseServices();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.AssemblyMarkerTypes.Add(typeof(MissingHandlerRequest));
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Findings.Should().Contain(f =>
            f.Code == "AFD103" &&
            f.Severity == DiagnosticSeverity.Error &&
            f.Message.Contains(nameof(MissingHandlerRequest), StringComparison.Ordinal));
    }

    [Fact]
    public void CreateReport_WithSingletonHandler_ReportsWarning()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IRequestHandler<PingRequest, string>, PingHandler>();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Findings.Should().Contain(f =>
            f.Code == "AFD201" &&
            f.Severity == DiagnosticSeverity.Warning &&
            f.Message.Contains("singleton", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void CreateReport_WithInvalidMapperCatalog_ReportsMapperValidationError()
    {
        var services = new ServiceCollection();
        services.AddOptions<MappingOptions>();
        services.AddScoped<IObjectMappingRule, UndeclaredMappingRule>();
        services.AddScoped<IObjectMappingValidator, AstraFlowObjectMappingValidator>();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Findings.Should().Contain(f =>
            f.Code == "AFD301" &&
            f.Severity == DiagnosticSeverity.Error &&
            f.Message.Contains(nameof(IDeclaredObjectMappingRule), StringComparison.Ordinal));
    }

    [Fact]
    public void CreateJsonReport_ContainsSummary()
    {
        var services = CreateBaseServices();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var json = reporter.CreateJsonReport();

        json.Should().Contain("\"summary\"");
        json.Should().Contain("\"requestHandlerCount\"");
    }

    [Fact]
    public void CreateMarkdownReport_ContainsRegistrationTables()
    {
        var services = CreateBaseServices();
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var markdown = reporter.CreateMarkdownReport();

        markdown.Should().Contain("# AstraFlow Diagnostics Report");
        markdown.Should().Contain("## Request Handlers");
        markdown.Should().Contain(nameof(PingHandler));
    }

    [Fact]
    public void CreateReport_WithProjectionValidationFinding_ReportsProjectionFinding()
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper([typeof(AstraFlowDiagnosticsTests)]);
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });

        using var provider = services.BuildServiceProvider();
        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

        var report = reporter.CreateReport();

        report.Findings.Should().Contain(f =>
            f.Code == "AFP103" &&
            f.Severity == DiagnosticSeverity.Warning);
    }

    private static ServiceCollection CreateBaseServices()
    {
        var services = new ServiceCollection();
        services.AddOptions<MappingOptions>();
        services.AddScoped<IRequestHandler<PingRequest, string>, PingHandler>();
        services.AddScoped<INotificationHandler<PingNotification>, PingNotificationHandler>();
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(PassThroughBehavior<,>));
        services.AddScoped<IRequestPreProcessor<PingRequest>, PingPreProcessor>();
        services.AddScoped<IRequestPostProcessor<PingRequest, string>, PingPostProcessor>();
        services.AddScoped<IRequestExceptionAction<PingRequest, string, InvalidOperationException>, PingExceptionAction>();
        services.AddScoped<IRequestExceptionHandler<PingRequest, string, InvalidOperationException>, PingExceptionHandler>();
        services.AddScoped<IRequestExceptionAction<VoidPingRequest, InvalidOperationException>, VoidPingExceptionAction>();
        services.AddScoped<IRequestExceptionHandler<VoidPingRequest, InvalidOperationException>, VoidPingExceptionHandler>();
        services.AddScoped<IObjectMappingRule, SampleMappingRule>();
        services.AddScoped<IObjectMappingValidator, AstraFlowObjectMappingValidator>();
        services.AddSingleton<IProjection<SampleEntity, SampleResponse>, SampleProjection>();
        return services;
    }

    public sealed record PingRequest(string Value) : IRequest<string>;

    public sealed record VoidPingRequest(string Value) : IRequest;

    public sealed record MissingHandlerRequest : IRequest<string>;

    public sealed record PingNotification : INotification;

    public sealed class PingHandler : IRequestHandler<PingRequest, string>
    {
        public Task<string> Handle(PingRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult(request.Value);
        }
    }

    public sealed class DuplicatePingHandler : IRequestHandler<PingRequest, string>
    {
        public Task<string> Handle(PingRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult($"duplicate:{request.Value}");
        }
    }

    public sealed class PingNotificationHandler : INotificationHandler<PingNotification>
    {
        public Task Handle(PingNotification notification, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class ZFirstNotificationHandler : INotificationHandler<PingNotification>
    {
        public Task Handle(PingNotification notification, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class ASecondNotificationHandler : INotificationHandler<PingNotification>
    {
        public Task Handle(PingNotification notification, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class PassThroughBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            return next();
        }
    }

    public sealed class PingPreProcessor : IRequestPreProcessor<PingRequest>
    {
        public Task Process(PingRequest request, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class ZFirstPreProcessor : IRequestPreProcessor<PingRequest>
    {
        public Task Process(PingRequest request, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class ASecondPreProcessor : IRequestPreProcessor<PingRequest>
    {
        public Task Process(PingRequest request, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class PingPostProcessor : IRequestPostProcessor<PingRequest, string>
    {
        public Task Process(PingRequest request, string response, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class PingExceptionAction
        : IRequestExceptionAction<PingRequest, string, InvalidOperationException>
    {
        public Task Execute(PingRequest request, InvalidOperationException exception, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class PingExceptionHandler
        : IRequestExceptionHandler<PingRequest, string, InvalidOperationException>
    {
        public Task Handle(
            PingRequest request,
            InvalidOperationException exception,
            RequestExceptionHandlerState<string> state,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class VoidPingExceptionAction
        : IRequestExceptionAction<VoidPingRequest, InvalidOperationException>
    {
        public Task Execute(VoidPingRequest request, InvalidOperationException exception, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class VoidPingExceptionHandler
        : IRequestExceptionHandler<VoidPingRequest, InvalidOperationException>
    {
        public Task Handle(
            VoidPingRequest request,
            InvalidOperationException exception,
            RequestExceptionHandlerState state,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed record SampleEntity(Guid Id, string Name);

    public sealed record SampleResponse(Guid Id, string Name);

    public sealed class SampleMappingRule : IDeclaredObjectMappingRule
    {
        public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
        [
            ObjectMappingPair.Create<SampleEntity, SampleResponse>()
        ];

        public bool CanMap(Type sourceType, Type destinationType)
        {
            return sourceType == typeof(SampleEntity) && destinationType == typeof(SampleResponse);
        }

        public object? Map(object? source, Type destinationType, IMapper mapper)
        {
            var entity = (SampleEntity)source!;
            return new SampleResponse(entity.Id, entity.Name);
        }
    }

    public sealed class UndeclaredMappingRule : IObjectMappingRule
    {
        public bool CanMap(Type sourceType, Type destinationType)
        {
            return sourceType == typeof(SampleEntity) && destinationType == typeof(SampleResponse);
        }

        public object? Map(object? source, Type destinationType, IMapper mapper)
        {
            var entity = (SampleEntity)source!;
            return new SampleResponse(entity.Id, entity.Name);
        }
    }

    public sealed class SampleProjection : IProjection<SampleEntity, SampleResponse>
    {
        public Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(entity.Id, entity.Name);
    }

    public sealed class RiskyProjection : IProjection<SampleEntity, SampleResponse>
    {
        public Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(Guid.NewGuid(), entity.Name);
    }
}
