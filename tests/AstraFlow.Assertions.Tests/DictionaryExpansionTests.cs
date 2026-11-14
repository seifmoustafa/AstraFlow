using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class DictionaryExpansionTests
{
    [Fact]
    public void EmptyAssertions_CheckEmptyAndNonEmptyDictionaries()
    {
        var empty = new Dictionary<string, int>();
        var populated = new Dictionary<string, int> { ["key"] = 1 };

        empty.Should().BeEmpty().And.HaveCount(0);
        populated.Should().NotBeEmpty().And.HaveCountGreaterThan(0).And.HaveCountLessThan(2);

        Assert.Throws<AstraFlowAssertionException>(() => populated.Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => empty.Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((IDictionary<string, int>?)null).Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => ((IDictionary<string, int>?)null).Should().NotBeEmpty());
    }

    [Fact]
    public void KeyBatchAssertions_UseTheDictionaryKeyComparer()
    {
        IDictionary<string, int> values = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["Alpha"] = 1,
            ["Beta"] = 2
        };

        values.Should().ContainKeys("alpha", "BETA", "alpha").And.NotContainKeys("missing");

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainKeys("alpha", "missing"));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContainKeys("ALPHA"));
    }

    [Fact]
    public void ValueBatchAssertions_UseDefaultEqualityAndTreatRepeatedExpectationsAsPresenceChecks()
    {
        IDictionary<string, int> values = new Dictionary<string, int>
        {
            ["first"] = 7,
            ["second"] = 9
        };

        values.Should().ContainValues(7, 9, 7).And.NotContainValues(10, 11);

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainValues(7, 10));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContainValues(9));
    }

    [Fact]
    public void CountAssertions_CompareDictionaryCountsAndRejectNegativeExpectations()
    {
        IDictionary<string, int> values = new Dictionary<string, int>
        {
            ["first"] = 7,
            ["second"] = 9
        };

        values.Should().HaveCount(2);
        values.Should().HaveCountGreaterThan(1).And.HaveCountLessThan(3);
        values.Should().HaveSameCount(new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 });

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountGreaterThan(2));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountLessThan(2));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveSameCount(new Dictionary<string, int>()));
        Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountGreaterThan(-1));
        Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountLessThan(-1));
    }

    [Fact]
    public void EmptyExpectedBatches_AreVacuouslySatisfiedEvenForNullSubjects()
    {
        IDictionary<string, string>? values = null;

        values.Should().ContainKeys().And.NotContainKeys();
        values.Should().ContainValues().And.NotContainValues();

        Assert.Throws<ArgumentNullException>(() => values.Should().ContainKeys((string[])null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().NotContainKeys((string[])null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().ContainValues((string[])null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().NotContainValues((string[])null!));
    }

    [Fact]
    public void ValueBatchFailures_DoNotIncludeDictionaryValues()
    {
        const string secret = "dictionary-value-secret";
        IDictionary<string, string> values = new Dictionary<string, string> { ["key"] = secret };

        var missing = Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainValues("missing-secret"));
        var unexpected = Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContainValues(secret));

        Assert.DoesNotContain(secret, missing.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("missing-secret", missing.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(secret, unexpected.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ReadOnlyDictionaryAndPairSequenceAssertions_SupportKeysValuesAndPairs()
    {
        var backing = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["Alpha"] = 7,
            ["Beta"] = 9
        };
        IReadOnlyDictionary<string, int> readOnly = new ReadOnlyOnlyDictionary<string, int>(backing);

        readOnly.Should()
            .ContainKey("alpha")
            .ContainKeys("ALPHA", "beta")
            .NotContainKeys("missing")
            .ContainValue(7)
            .NotContainValue(11)
            .ContainValues(7, 9)
            .NotContainValues(11)
            .Contain("BETA", 9);

        Assert.Throws<AstraFlowAssertionException>(() => readOnly.Should().NotContainKeys("alpha", "missing"));
        Assert.Throws<AstraFlowAssertionException>(() => readOnly.Should().Contain("missing", 7));

        var oneShotKeys = new OneShotEnumerable<KeyValuePair<string, int>>(backing);
        oneShotKeys.Should().ContainKeys("Alpha", "Beta");
        Assert.Equal(1, oneShotKeys.GetEnumeratorCalls);
        Assert.Equal(1, oneShotKeys.DisposeCalls);

        var oneShotValues = new OneShotEnumerable<KeyValuePair<string, int>>(backing);
        oneShotValues.Should().ContainValues(7, 9);
        Assert.Equal(1, oneShotValues.GetEnumeratorCalls);
        Assert.Equal(1, oneShotValues.DisposeCalls);

        var oneShotNegativeValues = new OneShotEnumerable<KeyValuePair<string, int>>(backing);
        oneShotNegativeValues.Should().NotContainValues(11, 12);
        Assert.Equal(1, oneShotNegativeValues.GetEnumeratorCalls);
        Assert.Equal(1, oneShotNegativeValues.DisposeCalls);
    }

    [Fact]
    public void PairSequenceDictionaryAssertions_ApplyNullAndPrivacyRules()
    {
        IEnumerable<KeyValuePair<string, string>>? nullPairs = null;

        nullPairs.Should().ContainKeys().And.NotContainKeys();
        nullPairs.Should().ContainValues().And.NotContainValues();

        Assert.Throws<AstraFlowAssertionException>(() => nullPairs.Should().ContainKey("secret-key"));
        Assert.Throws<AstraFlowAssertionException>(() => nullPairs.Should().NotContainKey("secret-key"));
        Assert.Throws<AstraFlowAssertionException>(() => nullPairs.Should().ContainValue("secret-value"));
        Assert.Throws<AstraFlowAssertionException>(() => nullPairs.Should().NotContainValue("secret-value"));
        Assert.Throws<AstraFlowAssertionException>(() => nullPairs.Should().NotContainValues("secret-value"));

        var pairs = new[] { new KeyValuePair<string, string>("safe-key", "secret-value") };
        var exception = Assert.Throws<AstraFlowAssertionException>(() => pairs.Should().ContainValues("missing-value"));
        Assert.DoesNotContain("secret-value", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("missing-value", exception.Message, StringComparison.Ordinal);
    }

    private sealed class ReadOnlyOnlyDictionary<TKey, TValue> : IReadOnlyDictionary<TKey, TValue>
        where TKey : notnull
    {
        private readonly IReadOnlyDictionary<TKey, TValue> _inner;

        public ReadOnlyOnlyDictionary(IReadOnlyDictionary<TKey, TValue> inner) => _inner = inner;

        public TValue this[TKey key] => _inner[key];

        public IEnumerable<TKey> Keys => _inner.Keys;

        public IEnumerable<TValue> Values => _inner.Values;

        public int Count => _inner.Count;

        public bool ContainsKey(TKey key) => _inner.ContainsKey(key);

        public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator() => _inner.GetEnumerator();

        public bool TryGetValue(TKey key, out TValue value)
        {
            if (_inner.TryGetValue(key, out var found))
            {
                value = found!;
                return true;
            }

            value = default!;
            return false;
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
