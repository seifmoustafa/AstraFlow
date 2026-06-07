using AstraFlow.Mediator;
using AstraFlow.Testing;
using Xunit;

namespace TestProjectCompatibilitySample;

public sealed class FakeSenderCompatibilityTests
{
    [Fact]
    public async Task Test_project_can_use_astraflow_testing_package_shape()
    {
        var sender = new FakeSender()
            .RespondWith<TestLookup, string>("ok");

        var response = await sender.Send(new TestLookup("value"));

        Assert.Equal("ok", response);
        Assert.Single(sender.Requests);
    }

    private sealed record TestLookup(string Value) : IRequest<string>;
}
