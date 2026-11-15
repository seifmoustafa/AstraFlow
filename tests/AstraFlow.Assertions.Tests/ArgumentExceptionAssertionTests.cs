using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class ArgumentExceptionAssertionTests
{
    [Fact]
    public void WithParameterName_MatchesTheParameterNameIgnoringCase()
    {
        Action action = () => throw new ArgumentNullException("value");

        var captured = action.Should().Throw<ArgumentNullException>()
            .WithParameterName("VALUE")
            .NotHaveParameterName("other");

        Assert.Equal("value", captured.Subject.ParamName);
    }

    [Fact]
    public void ParameterNameAssertions_AreOrdinalAndFailureDoesNotRevealNamesOrMessages()
    {
        Action action = () => throw new ArgumentException("private-message", "private-parameter");
        var captured = action.Should().Throw<ArgumentException>();

        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => captured.WithParameterName("expected-private-name"));

        Assert.DoesNotContain("private-message", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-parameter", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-private-name", failure.Message, StringComparison.Ordinal);
        captured.WithParameterName("PRIVATE-PARAMETER");
        Assert.Throws<AstraFlowAssertionException>(() => captured.NotHaveParameterName("PRIVATE-PARAMETER"));
    }

    [Fact]
    public async Task ParameterNameAssertions_ContinueAfterAsyncExceptionCapture()
    {
        Func<Task> action = () => Task.FromException(new ArgumentNullException("value"));

        var captured = await action.Should().ThrowAsync<ArgumentNullException>()
            .WithParameterName("value");

        Assert.Equal("value", captured.Subject.ParamName);
    }

    [Fact]
    public async Task NotHaveParameterName_ContinuesAfterAsyncExceptionCapture()
    {
        Func<Task> action = () => Task.FromException(new ArgumentException("private-message", "actual"));

        var captured = await action.Should().ThrowAsync<ArgumentException>()
            .NotHaveParameterName("different");

        Assert.Equal("actual", captured.Subject.ParamName);
    }

    [Fact]
    public void ParameterNameAssertions_ValidateInputs()
    {
        Action action = () => throw new ArgumentException("message", "value");
        var captured = action.Should().Throw<ArgumentException>();

        Assert.Throws<ArgumentNullException>(() => captured.WithParameterName(null!));
        Assert.Throws<ArgumentException>(() => captured.WithParameterName(string.Empty));
        Assert.Throws<ArgumentNullException>(() =>
            ArgumentExceptionAssertionExtensions.WithParameterName<ArgumentException>(
                (ExceptionAssertions<ArgumentException>)null!, "value"));
        Assert.Throws<ArgumentNullException>(() =>
            ArgumentExceptionAssertionExtensions.WithParameterName<ArgumentException>(
                (ExceptionAssertions<ArgumentException>)null!, null!));
    }

    [Fact]
    public async Task AsyncParameterNameAssertions_ValidateTaskAndExpectedName()
    {
        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await ArgumentExceptionAssertionExtensions.WithParameterName<ArgumentException>(
                (Task<ExceptionAssertions<ArgumentException>>)null!, "value"));

        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await ArgumentExceptionAssertionExtensions.WithParameterName<ArgumentException>(
                Task.FromResult<ExceptionAssertions<ArgumentException>>(null!), null!));

        Func<Task> action = () => Task.FromException(new ArgumentException("message", "value"));
        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await action.Should().ThrowAsync<ArgumentException>().WithParameterName(null!));

        var pending = new TaskCompletionSource<ExceptionAssertions<ArgumentException>>();
        var invalid = pending.Task.WithParameterName(string.Empty);
        var completed = await Task.WhenAny(invalid, Task.Delay(TimeSpan.FromSeconds(1)));
        Assert.Same(invalid, completed);
        await Assert.ThrowsAsync<ArgumentException>(() => invalid);
    }
}
