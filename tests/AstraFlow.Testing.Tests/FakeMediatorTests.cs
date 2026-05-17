using AstraFlow.Mediator;
using FluentAssertions;
using Xunit;

namespace AstraFlow.Testing.Tests;

public sealed class FakeMediatorTests
{
    [Fact]
    public async Task Fake_mediator_records_sent_requests_and_returns_configured_response()
    {
        var mediator = new FakeMediator()
            .RespondWith<CreateUser, Guid>((_, _) =>
                Task.FromResult(Guid.Parse("11111111-1111-1111-1111-111111111111")));

        var response = await mediator.Send(new CreateUser("admin"));

        response.Should().Be(Guid.Parse("11111111-1111-1111-1111-111111111111"));
        mediator.Requests.SingleSent<CreateUser>().Request.Should().BeOfType<CreateUser>();
    }

    [Fact]
    public async Task Fake_mediator_supports_runtime_object_send()
    {
        var mediator = new FakeMediator()
            .RespondWith<CreateUser, Guid>(Guid.Parse("22222222-2222-2222-2222-222222222222"));

        var response = await mediator.Send((object)new CreateUser("admin"));

        response.Should().Be(Guid.Parse("22222222-2222-2222-2222-222222222222"));
        mediator.Requests.SingleSent<CreateUser>().ResponseType.Should().Be(typeof(Guid));
    }

    [Fact]
    public async Task Fake_mediator_records_void_requests()
    {
        var completed = false;
        var mediator = new FakeMediator()
            .CompleteWith<RebuildIndex>((_, _) =>
            {
                completed = true;
                return Task.CompletedTask;
            });

        await mediator.Send(new RebuildIndex());

        completed.Should().BeTrue();
        mediator.Requests.SingleSent<RebuildIndex>().ResponseType.Should().Be(typeof(void));
    }

    [Fact]
    public async Task Fake_mediator_returns_configured_stream()
    {
        var mediator = new FakeMediator()
            .StreamWith<ExportUsers, string>((_, _) => Stream("admin", "operator"));

        var values = new List<string>();
        await foreach (var value in mediator.CreateStream(new ExportUsers()))
            values.Add(value);

        values.Should().Equal("admin", "operator");
        mediator.Requests.SingleSent<ExportUsers>().ResponseType.Should().Be(typeof(string));
    }

    [Fact]
    public async Task Fake_mediator_records_notifications_and_runs_configured_handlers()
    {
        var handled = false;
        var mediator = new FakeMediator()
            .OnPublish<UserCreated>((notification, _) =>
            {
                handled = notification.UserName == "admin";
                return Task.CompletedTask;
            });

        await mediator.Publish(new UserCreated("admin"));

        handled.Should().BeTrue();
        mediator.Notifications.SinglePublished<UserCreated>().Notification.Should().BeOfType<UserCreated>();
    }

    [Fact]
    public async Task Fake_sender_requires_registered_response()
    {
        var sender = new FakeSender();

        var act = () => sender.Send(new CreateUser("admin"));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    private sealed record CreateUser(string UserName) : IRequest<Guid>;

    private sealed record RebuildIndex : IRequest;

    private sealed record ExportUsers : IStreamRequest<string>;

    private sealed record UserCreated(string UserName) : INotification;

    private static async IAsyncEnumerable<string> Stream(params string[] values)
    {
        foreach (var value in values)
        {
            await Task.Yield();
            yield return value;
        }
    }
}
