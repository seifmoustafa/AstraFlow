using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class DictionaryEqualityTests
{
    [Fact]
    public void Equal_UsesKeyAndValueEqualityWithoutDependingOnEntryOrder()
    {
        var actual = new Dictionary<string, int>
        {
            ["first"] = 1,
            ["second"] = 2
        };
        var expected = new[]
        {
            new KeyValuePair<string, int>("second", 2),
            new KeyValuePair<string, int>("first", 1)
        };

        actual.Should().Equal(expected).And.NotEqual(new[]
        {
            new KeyValuePair<string, int>("first", 1),
            new KeyValuePair<string, int>("second", 3)
        });
    }

    [Fact]
    public void Equal_RejectsEntryCountKeyAndValueDifferencesWithoutLeakingEntries()
    {
        var actual = new Dictionary<string, string>
        {
            ["private-key-one"] = "private-value-one",
            ["private-key-two"] = "private-value-two"
        };

        var countMismatch = Assert.Throws<AstraFlowAssertionException>(() => actual.Should().Equal(
            new[] { new KeyValuePair<string, string>("private-key-one", "private-value-one") }));
        var keyMismatch = Assert.Throws<AstraFlowAssertionException>(() => actual.Should().Equal(new[]
        {
            new KeyValuePair<string, string>("private-key-one", "private-value-one"),
            new KeyValuePair<string, string>("private-key-three", "private-value-two")
        }));
        var valueMismatch = Assert.Throws<AstraFlowAssertionException>(() => actual.Should().Equal(new[]
        {
            new KeyValuePair<string, string>("private-key-one", "changed-secret"),
            new KeyValuePair<string, string>("private-key-two", "private-value-two")
        }));

        Assert.Contains("entry count", countMismatch.Message, StringComparison.Ordinal);
        Assert.Contains("key set", keyMismatch.Message, StringComparison.Ordinal);
        Assert.Contains("values", valueMismatch.Message, StringComparison.Ordinal);
        foreach (var message in new[] { countMismatch.Message, keyMismatch.Message, valueMismatch.Message })
        {
            Assert.DoesNotContain("private-key", message, StringComparison.Ordinal);
            Assert.DoesNotContain("private-value", message, StringComparison.Ordinal);
            Assert.DoesNotContain("changed-secret", message, StringComparison.Ordinal);
        }
    }

    [Fact]
    public void NotEqual_PassesForAKeyOrValueDifferenceAndFailsForTheSameMapping()
    {
        var actual = new Dictionary<string, int> { ["ready"] = 3 };

        actual.Should().NotEqual(new[] { new KeyValuePair<string, int>("ready", 4) });
        actual.Should().NotEqual(new[] { new KeyValuePair<string, int>("waiting", 3) });

        var exception = Assert.Throws<AstraFlowAssertionException>(() => actual.Should().NotEqual(
            new[] { new KeyValuePair<string, int>("ready", 3) }));
        Assert.DoesNotContain("ready", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("3", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Equal_ConsumesExpectedOneShotEntriesOnceAndDisposesTheEnumerator()
    {
        var actual = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
        var expected = new OneShotEnumerable<KeyValuePair<string, int>>(new[]
        {
            new KeyValuePair<string, int>("b", 2),
            new KeyValuePair<string, int>("a", 1)
        });

        actual.Should().Equal(expected);

        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);
    }

    [Fact]
    public void Equal_RejectsDuplicateExpectedKeysAndStillDisposesTheEnumerator()
    {
        var expected = new OneShotEnumerable<KeyValuePair<string, int>>(new[]
        {
            new KeyValuePair<string, int>("same", 1),
            new KeyValuePair<string, int>("same", 2)
        });

        Assert.Throws<ArgumentException>(() => new Dictionary<string, int> { ["same"] = 1 }.Should().Equal(expected));

        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);
    }

    [Fact]
    public void DictionaryEquality_RejectsNullExpectedEntriesAndNullSubjects()
    {
        IDictionary<string, int>? nullSubject = null;
        IEnumerable<KeyValuePair<string, int>>? nullExpected = null;
        var entries = new[] { new KeyValuePair<string, int>("a", 1) };

        var equalNull = Assert.Throws<ArgumentNullException>(() => new Dictionary<string, int>().Should().Equal(nullExpected!));
        var notEqualNull = Assert.Throws<ArgumentNullException>(() => new Dictionary<string, int>().Should().NotEqual(nullExpected!));
        Assert.Equal("expected", equalNull.ParamName);
        Assert.Equal("unexpected", notEqualNull.ParamName);

        Assert.Throws<AstraFlowAssertionException>(() => nullSubject.Should().Equal(entries));
        Assert.Throws<AstraFlowAssertionException>(() => nullSubject.Should().NotEqual(entries));
    }
}
