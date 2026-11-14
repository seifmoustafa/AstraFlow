using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class EquivalencyTests
{
    [Fact]
    public void BeEquivalentTo_CompareDifferentTypesByTheirPublicProperties()
    {
        var actual = new WorkItem("ready", new ActualDetails(3), new[] { 4, 5 });
        var expected = new WorkItemResponse("ready", new ResponseDetails(3), new[] { 4, 5 });

        actual.Should().BeEquivalentTo(expected);
        actual.Should().NotBeEquivalentTo(new WorkItemResponse("waiting", new ResponseDetails(3), new[] { 4, 5 }));
    }

    [Fact]
    public void BeEquivalentTo_UsesExpectedMembersAndAllowsAdditionalSubjectProperties()
    {
        var entity = new AuditedEntity("42", "ready", "created-by-admin", DateTime.UtcNow);
        var response = new WorkItemSummary("42", "ready");

        entity.Should().BeEquivalentTo(response);
        entity.Should().NotBeEquivalentTo(new WorkItemSummary("42", "waiting"));
    }

    [Fact]
    public void BeEquivalentTo_CanOptIntoPublicInstanceFieldsIncludingInheritedFields()
    {
        var subject = new FieldEntity(42, "safe-field-value");
        var expected = new FieldResponse(42, "safe-field-value");

        Assert.NotEqual(FieldEntity.StaticMarker, FieldResponse.StaticMarker);
        Assert.Throws<AstraFlowAssertionException>(() => subject.Should().BeEquivalentTo(expected));
        subject.Should().BeEquivalentTo(expected, options => options.IncludingFields());
        subject.Should().BeEquivalentTo(new FieldResponse(-1, "safe-field-value"), options => options
            .IncludingFields()
            .Excluding("Id"));

        var mismatch = Assert.Throws<AstraFlowAssertionException>(
            () => subject.Should().BeEquivalentTo(new FieldResponse(43, "different-secret"), options => options.IncludingFields()));
        Assert.Contains("$.Id", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("safe-field-value", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("different-secret", mismatch.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void BeEquivalentTo_UsesPerCallCustomValueComparers()
    {
        var actual = new UserEnvelope("ADMIN", "sensitive-value");
        var expected = new UserEnvelope("admin", "sensitive-value");

        actual.Should().BeEquivalentTo(expected, options => options.Using(StringComparer.OrdinalIgnoreCase));

        var different = Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(new UserEnvelope("admin", "another-value"), options => options.Using(StringComparer.OrdinalIgnoreCase)));
        Assert.Contains("$.Token", different.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("sensitive-value", different.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentNullException>(() => actual.Should().BeEquivalentTo(expected, options => options.Using<string>(null!)));
    }

    [Fact]
    public void BeEquivalentTo_PathComparerOverridesTheTypeComparerOnlyAtThatPath()
    {
        var actual = new UserEnvelope("ADMIN", "Token-Value");
        var expected = new UserEnvelope("admin", "Token-Value");

        actual.Should().BeEquivalentTo(expected, options => options
            .Using<string>(StringComparer.Ordinal)
            .Using("Name", StringComparer.OrdinalIgnoreCase));

        var changedToken = new UserEnvelope("admin", "token-value");
        var exception = Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(changedToken, options => options
                .Using<string>(StringComparer.Ordinal)
                .Using("Name", StringComparer.OrdinalIgnoreCase)));

        Assert.Contains("$.Token", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("Token-Value", exception.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentException>(() => actual.Should().BeEquivalentTo(expected, options => options.Using("Name..Token", StringComparer.Ordinal)));
    }

    [Fact]
    public void BeEquivalentTo_ExcludesOnlyTheRequestedNestedPath()
    {
        var actual = new TwoAddresses(new AddressNode("billing-actual"), new AddressNode("shipping-same"));
        var expected = new TwoAddresses(new AddressNode("billing-expected"), new AddressNode("shipping-same"));

        actual.Should().BeEquivalentTo(expected, options => options.ExcludingPath("billing.ApiKey"));

        var changedShipping = new TwoAddresses(new AddressNode("billing-expected"), new AddressNode("shipping-actual"));
        var exception = Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(changedShipping, options => options.ExcludingPath("Billing.ApiKey")));

        Assert.Contains("$.Shipping.ApiKey", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("billing-actual", exception.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentException>(() => actual.Should().BeEquivalentTo(expected, options => options.ExcludingPath("Billing..ApiKey")));

        var actualAddresses = new AddressCollection(new[] { new AddressNode("item-actual") });
        var expectedAddresses = new AddressCollection(new[] { new AddressNode("item-expected") });
        actualAddresses.Should().BeEquivalentTo(expectedAddresses, options => options.ExcludingPath("Items.ApiKey"));
    }

    [Fact]
    public void BeEquivalentTo_CanSelectOnlyTheRequestedNestedPath()
    {
        var actual = new TwoAddresses(new AddressNode("billing-actual"), new AddressNode("shipping-actual"));
        var expected = new TwoAddresses(new AddressNode("billing-expected"), new AddressNode("shipping-actual"));

        actual.Should().BeEquivalentTo(expected, options => options.IncludingPath("shipping.apikey"));

        var changedShipping = new TwoAddresses(new AddressNode("billing-actual"), new AddressNode("shipping-different"));
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(changedShipping, options => options.IncludingPath("shipping.apikey")));

        Assert.Contains("$.Shipping.ApiKey", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("shipping-actual", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("shipping-different", failure.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentException>(() => actual.Should().BeEquivalentTo(expected, options => options.IncludingPath("Shipping..ApiKey")));
        var missingPath = Assert.Throws<ArgumentException>(
            () => actual.Should().BeEquivalentTo(expected, options => options.IncludingPath("Shipping.Missing")));
        Assert.Contains("Shipping.Missing", missingPath.Message, StringComparison.Ordinal);

        var sameNode = new AddressNode("same");
        var missingOnSameReference = Assert.Throws<ArgumentException>(
            () => sameNode.Should().BeEquivalentTo(sameNode, options => options.IncludingPath("Missing")));
        Assert.Contains("Missing", missingOnSameReference.Message, StringComparison.Ordinal);

        var invalidScalarPath = Assert.Throws<ArgumentException>(
            () => new[] { 1 }.Should().BeEquivalentTo(new[] { 1 }, options => options.IncludingPath("Value")));
        Assert.Contains("Value", invalidScalarPath.Message, StringComparison.Ordinal);

        Assert.Throws<ArgumentException>(
            () => actual.Should().NotBeEquivalentTo(expected, options => options.IncludingPath("Shipping.Missing")));
    }

    [Fact]
    public void BeEquivalentTo_ValidatesSelectedPathsWithoutReadingOrEnumeratingTwice()
    {
        var actualGetter = new CountingGetterNode("same");
        var expectedGetter = new CountingGetterNode("same");
        actualGetter.Should().BeEquivalentTo(expectedGetter, options => options.IncludingPath("Value"));
        Assert.Equal(1, actualGetter.ReadCount);
        Assert.Equal(1, expectedGetter.ReadCount);

        var actualItems = new OneShotEnumerable<AddressNode>(new[] { new AddressNode("same") });
        var expectedItems = new OneShotEnumerable<AddressNode>(new[] { new AddressNode("same") });
        new AddressSequenceEnvelope(actualItems)
            .Should()
            .BeEquivalentTo(new AddressSequenceEnvelope(expectedItems), options => options.IncludingPath("Items.ApiKey"));

        Assert.Equal(1, actualItems.GetEnumeratorCalls);
        Assert.Equal(1, expectedItems.GetEnumeratorCalls);
        Assert.Equal(1, actualItems.DisposeCalls);
        Assert.Equal(1, expectedItems.DisposeCalls);

        var actualDictionary = new AddressDictionaryEnvelope(
            new Dictionary<string, DictionaryAddress> { ["billing"] = new("same", "actual-city") });
        var expectedDictionary = new AddressDictionaryEnvelope(
            new Dictionary<string, DictionaryAddress> { ["billing"] = new("same", "expected-city") });
        actualDictionary.Should().BeEquivalentTo(
            expectedDictionary,
            options => options.IncludingPath("Items.ApiKey"));

        var changedDictionaryValue = new AddressDictionaryEnvelope(
            new Dictionary<string, DictionaryAddress> { ["billing"] = new("different", "actual-city") });
        var dictionaryMismatch = Assert.Throws<AstraFlowAssertionException>(
            () => actualDictionary.Should().BeEquivalentTo(
                changedDictionaryValue,
                options => options.IncludingPath("Items.ApiKey")));
        Assert.Contains("$.Items[entry].ApiKey", dictionaryMismatch.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void BeEquivalentTo_CanCompareCollectionItemsWithoutOrderingAndPreserveDuplicates()
    {
        var outOfOrder = new[] { 2, 1, 1 };
        var expected = new[] { 1, 2, 1 };

        Assert.Throws<AstraFlowAssertionException>(() => outOfOrder.Should().BeEquivalentTo(expected));
        outOfOrder.Should().BeEquivalentTo(expected, options => options.IgnoringCollectionOrder());

        var differentMultiplicity = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { 1, 1, 2 }.Should().BeEquivalentTo(new[] { 1, 2, 2 }, options => options.IgnoringCollectionOrder()));
        Assert.Contains("$[", differentMultiplicity.Message, StringComparison.Ordinal);

        var actualCycle = new object[1];
        actualCycle[0] = actualCycle;
        var expectedCycle = new object[1];
        expectedCycle[0] = expectedCycle;
        actualCycle.Should().BeEquivalentTo(expectedCycle, options => options.IgnoringCollectionOrder());

        var firstActualValues = new OneShotEnumerable<int>(new[] { 1 });
        var secondActualValues = new OneShotEnumerable<int>(new[] { 2 });
        var firstExpectedValues = new OneShotEnumerable<int>(new[] { 2 });
        var secondExpectedValues = new OneShotEnumerable<int>(new[] { 1 });
        new[] { new SequenceEnvelope(firstActualValues), new SequenceEnvelope(secondActualValues) }
            .Should()
            .BeEquivalentTo(
                new[] { new SequenceEnvelope(firstExpectedValues), new SequenceEnvelope(secondExpectedValues) },
                options => options.IgnoringCollectionOrder());

        Assert.Equal(1, firstActualValues.GetEnumeratorCalls);
        Assert.Equal(1, secondActualValues.GetEnumeratorCalls);
        Assert.Equal(1, firstExpectedValues.GetEnumeratorCalls);
        Assert.Equal(1, secondExpectedValues.GetEnumeratorCalls);
        Assert.Equal(1, firstActualValues.DisposeCalls);
        Assert.Equal(1, secondActualValues.DisposeCalls);
        Assert.Equal(1, firstExpectedValues.DisposeCalls);
        Assert.Equal(1, secondExpectedValues.DisposeCalls);
    }

    [Fact]
    public void BeEquivalentTo_ReportNestedMismatchPathsWithoutPrintingValues()
    {
        const string actualSecret = "actual-sensitive-value";
        const string expectedSecret = "expected-sensitive-value";
        var actual = new WorkItem(actualSecret, new ActualDetails(7), new[] { 1, 2 });
        var expected = new WorkItemResponse(expectedSecret, new ResponseDetails(8), new[] { 1, 2 });

        var exception = Assert.Throws<AstraFlowAssertionException>(() => actual.Should().BeEquivalentTo(expected));

        Assert.Contains("$.Details.Count", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(actualSecret, exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(expectedSecret, exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("7", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("8", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void BeEquivalentTo_ApplyPerCallExclusionsAndDepthLimits()
    {
        var actual = new SecretDto("user", "actual-secret");
        var expected = new SecretDto("user", "expected-secret");

        actual.Should().BeEquivalentTo(expected, options => options.Excluding("ApiKey"));

        var deepActual = new GraphNode("root", new GraphNode("child", new GraphNode("actual-leaf", null)));
        var deepExpected = new GraphNode("root", new GraphNode("child", new GraphNode("expected-leaf", null)));
        var exception = Assert.Throws<AstraFlowAssertionException>(
            () => deepActual.Should().BeEquivalentTo(deepExpected, options => options.WithMaximumDepth(1)));

        Assert.Contains("$.Child.Child", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("actual-leaf", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-leaf", exception.Message, StringComparison.Ordinal);
        Assert.Throws<ArgumentOutOfRangeException>(() => actual.Should().BeEquivalentTo(expected, options => options.WithMaximumDepth(0)));
    }

    [Fact]
    public void BeEquivalentTo_HandleCyclesAndReadOnlyDictionaries()
    {
        var actualNode = new CyclicNode("same");
        actualNode.Next = actualNode;
        var expectedNode = new CyclicNode("same");
        expectedNode.Next = expectedNode;
        actualNode.Should().BeEquivalentTo(expectedNode);

        IReadOnlyDictionary<string, int> actual = new ReadOnlyOnlyDictionary<string, int>(
            new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) { ["Alpha"] = 1 });
        var expected = new Dictionary<string, int> { ["alpha"] = 1 };
        actual.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public void BeEquivalentTo_CompareSequencesInOrderAndEnumerateEachSubjectOnce()
    {
        var reordered = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { 1, 2 }.Should().BeEquivalentTo(new[] { 2, 1 }));
        Assert.Contains("$[0]", reordered.Message, StringComparison.Ordinal);

        var actualItems = new OneShotEnumerable<int>(new[] { 1, 2 });
        var expectedItems = new OneShotEnumerable<int>(new[] { 1, 2 });
        new SequenceEnvelope(actualItems).Should().BeEquivalentTo(new SequenceEnvelope(expectedItems));

        Assert.Equal(1, actualItems.GetEnumeratorCalls);
        Assert.Equal(1, actualItems.DisposeCalls);
        Assert.Equal(1, expectedItems.GetEnumeratorCalls);
        Assert.Equal(1, expectedItems.DisposeCalls);
    }

    [Fact]
    public void NotBeEquivalentTo_FailsOnlyWhenTheGraphsMatch()
    {
        var left = new SecretDto("one", "left");
        var right = new SecretDto("two", "right");

        left.Should().NotBeEquivalentTo(right);

        var exception = Assert.Throws<AstraFlowAssertionException>(() => left.Should().NotBeEquivalentTo(new SecretDto("one", "left")));
        Assert.DoesNotContain("left", exception.Message, StringComparison.Ordinal);
    }

    private sealed record WorkItem(string Name, ActualDetails Details, int[] Values);

    private sealed record WorkItemResponse(string Name, ResponseDetails Details, int[] Values);

    private sealed record AuditedEntity(string Id, string Name, string CreatedBy, DateTime CreatedAt);

    private sealed record WorkItemSummary(string Id, string Name);

    private sealed record UserEnvelope(string Name, string Token);

    private sealed record TwoAddresses(AddressNode Billing, AddressNode Shipping);

    private sealed record AddressNode(string ApiKey);

    private sealed record AddressSequenceEnvelope(IEnumerable<AddressNode> Items);

    private sealed record AddressDictionaryEnvelope(IReadOnlyDictionary<string, DictionaryAddress> Items);

    private sealed record DictionaryAddress(string ApiKey, string City);

    private sealed record AddressCollection(IReadOnlyList<AddressNode> Items);

    private sealed record ActualDetails(int Count);

    private sealed record ResponseDetails(int Count);

    private sealed record SecretDto(string Name, string ApiKey);

    private sealed class CountingGetterNode(string value)
    {
        public int ReadCount { get; private set; }

        public string Value
        {
            get
            {
                ReadCount++;
                return value;
            }
        }
    }

    private sealed record SequenceEnvelope(IEnumerable<int> Values);

    private sealed class FieldEntity(int id, string label) : FieldBase(id)
    {
        public string Label = label;
        public static string StaticMarker = "entity-static";
    }

    private sealed class FieldResponse(int id, string label) : FieldResponseBase(id)
    {
        public string Label = label;
        public static string StaticMarker = "response-static";
    }

    private class FieldBase(int id)
    {
        public int Id = id;
    }

    private class FieldResponseBase(int id)
    {
        public int Id = id;
    }

    private sealed record GraphNode(string Name, GraphNode? Child);

    private sealed class CyclicNode(string name)
    {
        public string Name { get; } = name;

        public CyclicNode? Next { get; set; }
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
