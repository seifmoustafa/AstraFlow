using AstraFlow.Mediator;
using FluentAssertions;
using Xunit;

namespace AstraFlow.Testing.Tests;

public sealed class HarnessTests
{
    [Fact]
    public async Task Handler_harness_executes_handler_directly()
    {
        var harness = new HandlerTestHarness<GetName, string>(new GetNameHandler());

        var response = await harness.Handle(new GetName("admin"));

        response.Should().Be("ADMIN");
    }

    [Fact]
    public void ValidationAssertions_ReportMissingExpectedProperty()
    {
        var errors = new Dictionary<string, string[]>
        {
            ["Name"] = ["Required"]
        };

        errors.ShouldContainValidationErrorFor("Name").Should().BeSameAs(errors);
        var act = () => errors.ShouldContainValidationErrorFor("Number");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Expected a validation error for 'Number'.");
    }

    [Fact]
    public void ValidationAssertions_ReportUnexpectedProperty()
    {
        var errors = new Dictionary<string, string[]>
        {
            ["Name"] = ["Required"]
        };

        errors.ShouldNotContainValidationErrorFor("Number").Should().BeSameAs(errors);
        var act = () => errors.ShouldNotContainValidationErrorFor("Name");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Expected no validation error for 'Name'.");
    }

    [Fact]
    public async Task Pipeline_harness_executes_behaviors_in_order()
    {
        var events = new List<string>();
        var harness = new PipelineTestHarness<GetName, string>(
            [
                new RecordingBehavior<GetName, string>("one", events),
                new RecordingBehavior<GetName, string>("two", events)
            ],
            (_, _) =>
            {
                events.Add("handler");
                return Task.FromResult("ok");
            });

        var response = await harness.Execute(new GetName("admin"));

        response.Should().Be("ok");
        events.Should().Equal("one:before", "two:before", "handler", "two:after", "one:after");
    }

    [Fact]
    public async Task Notification_handler_harness_executes_handler_directly()
    {
        var handler = new UserCreatedHandler();
        var harness = new NotificationHandlerTestHarness<UserCreated>(handler);

        await harness.Handle(new UserCreated("admin"));

        handler.HandledUserName.Should().Be("admin");
    }

    private sealed record GetName(string Value) : IRequest<string>;

    private sealed class GetNameHandler : IRequestHandler<GetName, string>
    {
        public Task<string> Handle(GetName request, CancellationToken cancellationToken)
        {
            return Task.FromResult(request.Value.ToUpperInvariant());
        }
    }

    private sealed class RecordingBehavior<TRequest, TResponse>(
        string name,
        IList<string> events) : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            events.Add(name + ":before");
            var response = await next().ConfigureAwait(false);
            events.Add(name + ":after");
            return response;
        }
    }

    private sealed record UserCreated(string UserName) : INotification;

    private sealed class UserCreatedHandler : INotificationHandler<UserCreated>
    {
        public string? HandledUserName { get; private set; }

        public Task Handle(UserCreated notification, CancellationToken cancellationToken)
        {
            HandledUserName = notification.UserName;
            return Task.CompletedTask;
        }
    }
}
