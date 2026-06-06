using AstraFlow.AspNetCore;
using AstraFlow.Diagnostics;
using AstraFlow.Mediator;
using FluentAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace AstraFlow.AspNetCore.Tests;

public sealed class AstraFlowAspNetCoreTests
{
    [Fact]
    public void DiagnosticsEndpointPolicy_DefaultsToDevelopmentOnly()
    {
        var options = new AstraFlowAspNetCoreOptions();

        AstraFlowDiagnosticsEndpointPolicy.IsEnabled(new TestEnvironment("Development"), options)
            .Should()
            .BeTrue();
        AstraFlowDiagnosticsEndpointPolicy.IsEnabled(new TestEnvironment("Production"), options)
            .Should()
            .BeFalse();
    }

    [Fact]
    public void DiagnosticsEndpointPolicy_AllowsExplicitProductionOptIn()
    {
        var options = new AstraFlowAspNetCoreOptions
        {
            EnableDiagnosticsOutsideDevelopment = true
        };

        AstraFlowDiagnosticsEndpointPolicy.IsEnabled(new TestEnvironment("Production"), options)
            .Should()
            .BeTrue();
    }

    [Fact]
    public void ProblemDetailsMapper_GroupsValidationErrors()
    {
        var problem = AstraFlowProblemDetailsMapper.ToValidationProblemDetails(
            new Dictionary<string, string[]>
            {
                ["Number"] = ["Required"]
            });

        problem.Status.Should().Be(400);
        problem.Errors.Should().ContainKey("Number");
        problem.Errors["Number"].Should().ContainSingle().Which.Should().Be("Required");
    }

    [Fact]
    public void HealthSummary_IsUnhealthyWhenDiagnosticsHaveErrors()
    {
        var report = new AstraFlowDiagnosticReport(
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            new AstraFlowDiagnosticsSummary(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));

        var summary = AstraFlowHealthSummary.FromReport(report);

        summary.Status.Should().Be("Unhealthy");
    }

    [Fact]
    public void AddAstraFlowAspNetCore_RegistersOptionsAndFilter()
    {
        var services = new ServiceCollection();

        services.AddAstraFlowAspNetCore(options =>
        {
            options.IncludeDiagnosticsFindings = true;
        });

        using var provider = services.BuildServiceProvider();

        provider.GetRequiredService<IOptions<AstraFlowAspNetCoreOptions>>()
            .Value
            .IncludeDiagnosticsFindings
            .Should()
            .BeTrue();
        provider.GetRequiredService<AstraFlowValidationProblemEndpointFilter>().Should().NotBeNull();
    }

    [Fact]
    public async Task ControllerHelper_ResponseRequest_ReturnsOk()
    {
        var controller = new TestController();
        var sender = new TestSender(new Pong("ok"));

        var result = await controller.SendAstraFlow(sender, new Ping("hello"));

        result.Result.Should().BeOfType<OkObjectResult>()
            .Which
            .Value
            .Should()
            .Be(new Pong("ok"));
    }

    [Fact]
    public async Task ControllerHelper_VoidRequest_ReturnsNoContent()
    {
        var controller = new TestController();
        var sender = new TestSender(null);

        var result = await controller.SendAstraFlow(sender, new VoidPing());

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public void MinimalApiHelpers_MapRoutes()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddAstraFlowAspNetCore();
        var app = builder.Build();

        app.MapAstraFlowSend<Ping, Pong>("/ping");
        app.MapAstraFlowCommand<VoidPing>("/void-ping");
        app.MapAstraFlowDiagnostics();
        app.MapAstraFlowHealthSummary();

        app.Services.Should().NotBeNull();
    }

    private sealed record Ping(string Value) : IRequest<Pong>;

    private sealed record Pong(string Value);

    private sealed record VoidPing : IRequest;

    private sealed class TestController : ControllerBase;

    private sealed class TestSender(object? response) : ISender
    {
        public Task Send(IRequest request, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult((TResponse)response!);
        }

        public Task<object?> Send(object request, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(response);
        }
    }

    private sealed class TestEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;

        public string ApplicationName { get; set; } = "Tests";

        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;

        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } =
            new Microsoft.Extensions.FileProviders.NullFileProvider();
    }
}
