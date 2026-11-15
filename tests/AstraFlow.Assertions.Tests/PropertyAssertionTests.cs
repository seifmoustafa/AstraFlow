using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class PropertyAssertionTests
{
    [Fact]
    public void HaveProperty_ReturnsTheTypedValueForFurtherAssertions()
    {
        var subject = new PropertySubject("customer-42");

        var selected = subject.Should().HaveProperty((PropertySubject value) => value.Name);

        Assert.Equal("customer-42", selected.Which);
        selected.Which.Should().Be("customer-42");
        Assert.Same(selected, selected.And);
    }

    [Fact]
    public void HaveProperty_SupportsNestedPathsAndEvaluatesEachGetterOnce()
    {
        var leaf = new PropertyLeaf("nested-value");
        var subject = new PropertySubject(leaf);

        var selected = subject.Should().HaveProperty((PropertySubject value) => value.Child!.Value);

        Assert.Equal("nested-value", selected.Subject);
        Assert.Equal(1, subject.ChildReadCount);
        Assert.Equal(1, leaf.ValueReadCount);
    }

    [Fact]
    public void HaveProperty_PropagatesTheOriginalPropertyGetterException()
    {
        var expected = new InvalidOperationException("private-property-error");
        var subject = new PropertySubject(expected);

        var actual = Assert.Throws<InvalidOperationException>(
            () => subject.Should().HaveProperty((PropertySubject value) => value.ThrowingValue));

        Assert.Same(expected, actual);
    }

    [Fact]
    public void HaveProperty_RejectsNullSubjectsAndInvalidSelectors()
    {
        var assertions = AssertionExtensions.Should((object?)null);

        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => assertions.HaveProperty((PropertySubject value) => value.Name));
        Assert.DoesNotContain("Name", failure.Message, StringComparison.Ordinal);

        var subject = new PropertySubject("value").Should();
        Assert.Throws<ArgumentNullException>(() =>
            PropertyAssertionExtensions.HaveProperty<PropertySubject, string>(subject, null!));
        Assert.Throws<ArgumentException>(() => subject.HaveProperty((PropertySubject value) => value.GetName()));
        Assert.Throws<ArgumentException>(() => subject.HaveProperty((PropertySubject value) => value.Field));
        Assert.Throws<ArgumentException>(() => subject.HaveProperty((PropertySubject value) => value[0]));
        Assert.Throws<ArgumentException>(() => subject.HaveProperty((PropertySubject value) => PropertySubject.StaticValue));

        var otherSubject = new OtherPropertySubject().Should();
        Assert.Throws<AstraFlowAssertionException>(
            () => otherSubject.HaveProperty((PropertySubject value) => value.Name));
    }

    private sealed class PropertySubject
    {
        private readonly string _name;
        private readonly Exception _throwingValue;

        public PropertySubject(string name)
        {
            _name = name;
            _throwingValue = new InvalidOperationException("unexpected");
        }

        public PropertySubject(PropertyLeaf child)
        {
            ChildValue = child;
            _name = "parent";
            _throwingValue = new InvalidOperationException("unexpected");
        }

        public PropertySubject(Exception throwingValue)
        {
            _name = "throwing";
            _throwingValue = throwingValue;
        }

        public static string StaticValue => "static";

        public string Name => _name;

        public int ChildReadCount { get; private set; }

        private PropertyLeaf? ChildValue { get; }

        public PropertyLeaf? Child
        {
            get
            {
                ChildReadCount++;
                return ChildValue;
            }
        }

        public string ThrowingValue => throw _throwingValue;

        public string Field = "field";

        public string this[int index] => index.ToString();

        public string GetName() => _name;
    }

    private sealed class PropertyLeaf(string value)
    {
        private readonly string _value = value;

        public int ValueReadCount { get; private set; }

        public string Value
        {
            get
            {
                ValueReadCount++;
                return _value;
            }
        }
    }

    private sealed class OtherPropertySubject
    {
    }
}
