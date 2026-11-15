using AstraFlow.Assertions;

var value = new DerivedValue();
var createdIds = new[] { 12, 24 };
IDictionary<string, int> statusCodes = new Dictionary<string, int> { ["created"] = 201 };
42.Should().Be(42);
42.Should().BeInRange(40, 44);
true.Should().BeTrue();
Guid.Empty.Should().BeEmpty();
Access.ReadWrite.Should().BeDefined();
Access.ReadWrite.Should().HaveFlag(Access.Read);
value.Should().BeSameAs(value);
value.Should().BeOfType<DerivedValue>().Should().BeSameAs(value);
createdIds.Should().HaveCount(2);
createdIds.Should().Contain(value => value == 24).And.ContainInOrder(12, 24);
var onlyCreatedId = createdIds.Should().ContainSingle(value => value == 12).Which;
if (onlyCreatedId != 12) throw new InvalidOperationException("Single-item result access failed.");
statusCodes.Should().Contain("created", 201);
"created".Should().StartWith("cre");
var expectedException = ((Action)(() => throw new InvalidOperationException("expected consumer failure")))
    .Should().Throw<InvalidOperationException>().WithMessage("expected *").And.Which;
if (expectedException.Message != "expected consumer failure") throw new InvalidOperationException("Exception result access failed.");
Func<string> function = () => throw new InvalidOperationException("function failure");
if (function.Should().Throw<InvalidOperationException>().Which.Message != "function failure") throw new InvalidOperationException("Function exception assertion failed.");
Func<Task<int>> asyncFunction = () => Task.FromException<int>(new InvalidOperationException("async function failure"));
if ((await asyncFunction.Should().ThrowAsync<InvalidOperationException>()).Which.Message != "async function failure") throw new InvalidOperationException("Async function exception assertion failed.");
ExpectAssertionFailure(() => "private-value".Should().Contain("missing"));
ExpectAssertionFailure(() => new[] { 1, 2 }.Should().Equal(2, 1));
ExpectAssertionFailure(() => 42.Should().BeGreaterThan(42));

static void ExpectAssertionFailure(Action assertion)
{
    try
    {
        assertion();
    }
    catch (AstraFlowAssertionException)
    {
        return;
    }

    throw new InvalidOperationException("Expected an assertion failure.");
}

Console.WriteLine("AstraFlow.Assertions sample passed.");

internal class BaseValue { }
internal sealed class DerivedValue : BaseValue { }

[Flags]
internal enum Access
{
    None = 0,
    Read = 1,
    Write = 2,
    ReadWrite = Read | Write
}
