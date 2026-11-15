using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CoreAssertionTests
{
    [Fact]
    public void ObjectAssertions_CheckEqualityNullabilityAndIdentity()
    {
        var value = new TestValue();

        42.Should().Be(42);
        41.Should().NotBe(42);
        43.Should().BeGreaterThan(42);
        42.Should().BeGreaterThanOrEqualTo(42);
        41.Should().BeLessThan(42);
        42.Should().BeLessThanOrEqualTo(42);
        42.Should().BeInRange(40, 44);
        true.Should().BeTrue();
        false.Should().BeFalse();
        "value".Should().NotBeNullOrEmpty();
        value.Should().BeSameAs(value);
        value.Should().NotBeSameAs(new TestValue());
        value.Should().NotBeNull();
        ((object?)null).Should().BeNull();
        value.Should().BeOfType<TestValue>().Should().BeSameAs(value);
    }

    [Fact]
    public void ObjectAssertions_ReportMismatchWithoutCallingArbitraryToString()
    {
        var value = new SecretValue();

        var exception = Assert.Throws<AstraFlowAssertionException>(() => value.Should().Be(new SecretValue()));

        Assert.DoesNotContain("top-secret", exception.Message, StringComparison.Ordinal);
        Assert.Contains(nameof(SecretValue), exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ObjectAssertions_IncludeBecauseReasonWhenEqualityFails()
    {
        42.Should().Be(42, "matching values are accepted");

        var failure = Assert.Throws<AstraFlowAssertionException>(() => 41.Should().Be(42, "the result must match the contract"));

        Assert.Contains("Because the result must match the contract.", failure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ObjectAssertions_ReportAllCoreFailureKinds()
    {
        var value = new TestValue();

        Assert.Throws<AstraFlowAssertionException>(() => 1.Should().NotBe(1));
        Assert.Throws<AstraFlowAssertionException>(() => 1.Should().Be(2));
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().BeNull());
        Assert.Throws<AstraFlowAssertionException>(() => ((object?)null).Should().NotBeNull());
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().NotBeSameAs(value));
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().BeOfType<string>());
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().BeAssignableTo<string>());
    }

    [Fact]
    public void BooleanAssertions_ReportIncorrectExpectedValue()
    {
        Assert.Throws<AstraFlowAssertionException>(() => false.Should().BeTrue());
        Assert.Throws<AstraFlowAssertionException>(() => true.Should().BeFalse());
    }

    [Fact]
    public void ComparableAndGuidAssertions_CheckRangesAndEmptyGuid()
    {
        Guid.Empty.Should().BeEmpty();
        var identifier = Guid.NewGuid();
        identifier.Should().NotBeEmpty();
        identifier.Should().Be(identifier);
        Assert.Throws<AstraFlowAssertionException>(() => 42.Should().BeGreaterThan(42));
        Assert.Throws<AstraFlowAssertionException>(() => 41.Should().BeGreaterThanOrEqualTo(42));
        Assert.Throws<AstraFlowAssertionException>(() => 42.Should().BeLessThan(42));
        Assert.Throws<AstraFlowAssertionException>(() => 43.Should().BeLessThanOrEqualTo(42));
        Assert.Throws<ArgumentException>(() => 42.Should().BeInRange(44, 40));
        Assert.Throws<AstraFlowAssertionException>(() => 42.Should().BeInRange(44, 50));
        Assert.Throws<AstraFlowAssertionException>(() => Guid.Empty.Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => identifier.Should().Be(Guid.Empty));
    }

    [Fact]
    public void EnumAssertions_CheckDefinedValuesAndFlags()
    {
        Access.ReadWrite.Should().BeDefined();
        Access.ReadWrite.Should().HaveFlag(Access.Read);
        Access.Read.Should().NotHaveFlag(Access.Write);
        Assert.Throws<AstraFlowAssertionException>(() => ((Access)8).Should().BeDefined());
        Assert.Throws<AstraFlowAssertionException>(() => Access.Read.Should().HaveFlag(Access.Write));
        Assert.Throws<AstraFlowAssertionException>(() => Access.ReadWrite.Should().NotHaveFlag(Access.Read));
    }

    [Fact]
    public void StringAssertions_UseOrdinalComparisonsAndDoNotPrintContents()
    {
        "AstraFlow".Should().StartWith("Astra");
        "AstraFlow".Should().Contain("Flow").And.EndWith("Flow");

        var exception = Assert.Throws<AstraFlowAssertionException>(() => "private-token".Should().Contain("missing"));

        Assert.DoesNotContain("private-token", exception.Message, StringComparison.Ordinal);
        Assert.Contains("length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void StringAssertions_CoverEqualityEmptyWhitespaceAndNegativeSearches()
    {
        "same".Should().Be("same");
        ((string?)null).Should().BeNull();
        "".Should().BeEmpty();
        ((string?)null).Should().BeNullOrEmpty();
        "".Should().BeNullOrEmpty();
        " ".Should().BeNullOrWhiteSpace();
        "text".Should().NotBeNullOrWhiteSpace();
        "text".Should().NotBeNullOrEmpty();
        "text".Should().NotContain("absent");

        Assert.Throws<AstraFlowAssertionException>(() => "TEXT".Should().Be("text"));
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().BeNull());
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().BeNullOrEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => "".Should().NotBeNullOrEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().BeNullOrWhiteSpace());
        Assert.Throws<AstraFlowAssertionException>(() => " ".Should().NotBeNullOrWhiteSpace());
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotBeNullOrWhiteSpace());
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().NotContain("ex"));
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().StartWith("x"));
        Assert.Throws<AstraFlowAssertionException>(() => "text".Should().EndWith("x"));
    }

    [Fact]
    public void CollectionAssertions_CheckCountMembershipAndOrderedEquality()
    {
        new[] { new KeyValuePair<string, int>("first", 1) }.Should().ContainKey("first");
        Assert.Throws<AstraFlowAssertionException>(() => new[] { new KeyValuePair<string, int>("first", 1) }.Should().ContainKey("missing"));
        var values = new[] { "first", "second", "third" };

        values.Should().HaveCount(3).And.Contain("second");
        values.Should().NotBeEmpty();
        values.Should().NotContain("fourth");
        values.Should().Equal("first", "second", "third");
        new[] { "first", "skip", "third" }.Should().ContainInOrder("first", "third");
        Array.Empty<int>().Should().BeEmpty();
    }

    [Fact]
    public void CollectionAssertions_CheckReferenceIdentity()
    {
        IEnumerable<int> values = new[] { 1, 2 };
        IEnumerable<int> otherValues = new[] { 1, 2 };

        values.Should().BeSameAs(values).And.NotBeSameAs(otherValues);
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().BeSameAs(otherValues));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotBeSameAs(values));
    }

    [Fact]
    public void CollectionAssertions_ReportOrderAndCountFailures()
    {
        var orderFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().Equal(2, 1));
        var countFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().HaveCount(3));

        Assert.Contains("index 0", orderFailure.Message, StringComparison.Ordinal);
        Assert.Contains("count 3", countFailure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void CollectionAssertions_CheckSingleMatchingAndPredicateRules()
    {
        var values = new[] { 2, 4, 6 };

        Assert.Equal(4, values.Should().ContainSingle(value => value == 4).Which);
        Assert.Equal(4, values.Should().ContainSingle(value => value == 4).And.Subject);
        Assert.Equal(4, new[] { 4 }.Should().ContainSingle().Subject);
        values.Should().OnlyContain(value => value % 2 == 0);
        values.Should().Contain(value => value == 4);
        values.Should().NotContain(value => value < 0);

        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().ContainSingle());
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainSingle(value => value > 1));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().OnlyContain(value => value < 6));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().Contain(value => value == 8));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContain(value => value == 4));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { "third", "first" }.Should().ContainInOrder("first", "third"));
        Assert.Throws<ArgumentNullException>(() => values.Should().Contain((Func<int, bool>)null!));
    }

    [Fact]
    public void CollectionAssertions_CoverMultipleExpectedItemsExactTypesAndPredicateEdges()
    {
        var values = new[] { 1, 2, 3 };

        values.Should().Contain(1, 3);
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().Contain(1, 4));
        Assert.Same(values, values.Should().BeOfType<int[]>());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>)values).Should().BeOfType<List<int>>());
        values.Should().ContainInOrder();
        values.Should().OnlyContain(value => value > 0);

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainSingle());
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainSingle(value => value > 4));
        Assert.Throws<ArgumentNullException>(() => values.Should().ContainSingle((Func<int, bool>)null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().NotContain((Func<int, bool>)null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().OnlyContain(null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().ContainInOrder((int[])null!));
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().Contain(1));
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().OnlyContain(value => value > 0));
    }

    [Fact]
    public void ExceptionAssertions_MatchMessagesWithOrdinalGlobPatternsWithoutEchoingMessages()
    {
        var exception = ((Action)(() => throw new InvalidOperationException("private token: abc-123")))
            .Should()
            .Throw<InvalidOperationException>()
            .WithMessage("private token: *");

        Assert.Equal("private token: abc-123", exception.Message);

        var failure = Assert.Throws<AstraFlowAssertionException>(() =>
            ((Action)(() => throw new InvalidOperationException("secret-message")))
                .Should()
                .Throw<InvalidOperationException>()
                .WithMessage("expected"));
        Assert.DoesNotContain("secret-message", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected", failure.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentNullException>(() => exception.WithMessage(null!));
    }

    [Fact]
    public void DictionaryAssertions_CheckKeysPairsValuesAndCount()
    {
        IDictionary<string, int> values = new Dictionary<string, int>
        {
            ["first"] = 1,
            ["second"] = 2
        };

        values.Should().BeSameAs(values).And.ContainKey("first");
        values.Should().NotBeSameAs(new Dictionary<string, int>());
        values.Should().NotContainKey("third");
        values.Should().Contain("second", 2);
        values.Should().ContainValue(1);
        values.Should().HaveCount(2);

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainKey("missing"));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContainKey("first"));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().Contain("second", 3));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainValue(3));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCount(1));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotBeSameAs(values));
        Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCount(-1));
    }

    [Fact]
    public void CollectionAssertions_CoverNullEmptyAndSequenceLengthFailures()
    {
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().HaveCount(0));
        Assert.Throws<ArgumentOutOfRangeException>(() => Array.Empty<int>().Should().HaveCount(-1));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().NotContain(2));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().Contain(3));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().Equal(1, 2));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().Equal(1));
    }

    [Fact]
    public void TypeAssertions_DistinguishExactAndAssignableTypes()
    {
        object value = new DerivedValue();

        value.Should().BeAssignableTo<BaseValue>();
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().BeOfType<BaseValue>());
        value.Should().BeOfType<DerivedValue>();
    }

    [Fact]
    public void ActionAssertions_ReturnExpectedExceptionAndRejectMissingOrWrongExceptions()
    {
        var thrown = ((Action)(() => throw new InvalidOperationException("failure"))).Should().Throw<InvalidOperationException>();

        Assert.Equal("failure", thrown.Which.Message);
        Assert.Same(thrown.Which, thrown.Subject);
        Assert.Same(thrown.Which, thrown.And.Which);
        Assert.Equal("failure", thrown.Message);
        Assert.Throws<AstraFlowAssertionException>(() => ((Action)(() => { })).Should().Throw<InvalidOperationException>());
        Assert.Throws<AstraFlowAssertionException>(() => ((Action)(() => throw new ArgumentException())).Should().Throw<InvalidOperationException>());
    }

    [Fact]
    public void ActionAssertions_CheckNoThrowBehavior()
    {
        ((Action)(() => { })).Should().NotThrow();
        Assert.Throws<AstraFlowAssertionException>(() => ((Action)(() => throw new InvalidOperationException())).Should().NotThrow());
    }

    [Fact]
    public void FunctionAssertions_CheckExpectedExceptionAndNoThrow()
    {
        Func<string> throws = () => throw new InvalidOperationException("function failure");
        Func<string> returns = () => "result";

        Assert.Equal("function failure", throws.Should().Throw<InvalidOperationException>().Which.Message);
        returns.Should().NotThrow();
        Assert.Throws<AstraFlowAssertionException>(() => returns.Should().Throw<InvalidOperationException>());
        Assert.Throws<AstraFlowAssertionException>(() => throws.Should().NotThrow());
        Assert.Throws<AstraFlowAssertionException>(() => throws.Should().Throw<ArgumentException>());
    }

    [Fact]
    public async Task AsyncActionAssertions_ReturnExpectedExceptionAndReportMissingException()
    {
        Func<Task> throws = () => Task.FromException(new InvalidOperationException("async failure"));
        Func<Task> succeeds = () => Task.CompletedTask;

        var thrown = await throws.Should().ThrowAsync<InvalidOperationException>();

        Assert.Equal("async failure", thrown.Which.Message);
        Assert.Same(thrown.Which, thrown.WithMessage("async *").And.Which);
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => succeeds.Should().ThrowAsync<InvalidOperationException>());
        await succeeds.Should().NotThrowAsync();
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => throws.Should().NotThrowAsync());
        Func<Task> wrongException = () => Task.FromException(new ArgumentException());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => wrongException.Should().ThrowAsync<InvalidOperationException>());
    }

    [Fact]
    public async Task ExceptionAssertions_CheckAsyncMessageExtensionOverload()
    {
        Func<Task> throws = () => Task.FromException(new InvalidOperationException("private async detail"));

        var result = await throws.Should().ThrowAsync<InvalidOperationException>().WithMessage("private * detail");

        Assert.Equal("private async detail", result.Which.Message);
        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(async () =>
            await throws.Should().ThrowAsync<InvalidOperationException>().WithMessage("different"));
        Assert.DoesNotContain("private async detail", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("different", failure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AsyncFunctionAssertions_CheckExpectedExceptionAndNoThrow()
    {
        Func<Task<int>> throws = () => Task.FromException<int>(new InvalidOperationException("async function failure"));
        Func<Task<int>> returns = () => Task.FromResult(42);

        Assert.Equal("async function failure", (await throws.Should().ThrowAsync<InvalidOperationException>()).Which.Message);
        await returns.Should().NotThrowAsync();
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => returns.Should().ThrowAsync<InvalidOperationException>());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => throws.Should().NotThrowAsync());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => throws.Should().ThrowAsync<ArgumentException>());
    }

    private sealed class TestValue { }

    private sealed class SecretValue
    {
        public override string ToString() => "top-secret";
    }

    private class BaseValue { }

    private sealed class DerivedValue : BaseValue { }

    [Flags]
    private enum Access
    {
        None = 0,
        Read = 1,
        Write = 2,
        ReadWrite = Read | Write
    }
}
