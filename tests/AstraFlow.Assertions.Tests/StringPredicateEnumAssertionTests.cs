using System.Globalization;
using System.Text.RegularExpressions;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class StringPredicateEnumAssertionTests
{
    [Fact]
    public void StringNegativeNullAndLengthAssertionsFollowTheirContracts()
    {
        "actual".Should().NotBe("different");
        ((string?)null).Should().NotBe("different");
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotBe(null));
        "value".Should().NotBeNull();
        "value".Should().NotBeEmpty();
        " ".Should().NotBeEmpty();
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotBeNull());
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => "".Should().NotBeEmpty());

        "".Should().HaveLength(0);
        "four".Should().HaveLength(4);
        var lengthFailure = Assert.Throws<AstraFlowAssertionException>(() => "private-value".Should().HaveLength(4));
        Assert.DoesNotContain("private-value", lengthFailure.Message);
        var invalidLength = Assert.Throws<ArgumentOutOfRangeException>(() => "x".Should().HaveLength(-1));
        Assert.Equal("expected", invalidLength.ParamName);
        Assert.Null(invalidLength.ActualValue);
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().HaveLength(0));
    }

    [Fact]
    public void NegativePrefixAndSuffixUseOrdinalSearchAndRejectNullInputs()
    {
        "Alpha ending".Should().NotStartWith("alpha");
        "Alpha ending".Should().NotEndWith("ENDING");
        Assert.Throws<AstraFlowAssertionException>(() => "Alpha".Should().NotStartWith("Al"));
        Assert.Throws<AstraFlowAssertionException>(() => "ending".Should().NotEndWith("ing"));
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotStartWith("x"));
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().NotEndWith("x"));

        Assert.Equal("unexpected", Assert.Throws<ArgumentNullException>(() => "value".Should().NotStartWith(null!)).ParamName);
        Assert.Equal("unexpected", Assert.Throws<ArgumentNullException>(() => "value".Should().NotEndWith(null!)).ParamName);
    }

    [Fact]
    public void EquivalentStringComparisonIsExplicitAndCultureIndependentWhenOrdinal()
    {
        var originalCulture = CultureInfo.CurrentCulture;
        try
        {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("tr-TR");
            "FILE".Should().BeEquivalentTo("file", StringComparison.OrdinalIgnoreCase);
            "FILE".Should().BeEquivalentTo("file", StringComparison.InvariantCultureIgnoreCase);
            ((string?)null).Should().BeEquivalentTo(null, StringComparison.Ordinal);
            Assert.Throws<AstraFlowAssertionException>(() => "FILE".Should().BeEquivalentTo("file", StringComparison.Ordinal));
            var failure = Assert.Throws<AstraFlowAssertionException>(() => "secret-expected".Should().BeEquivalentTo("different", StringComparison.Ordinal));
            Assert.DoesNotContain("secret-expected", failure.Message);

            var invalid = Assert.Throws<ArgumentOutOfRangeException>(() => "value".Should().BeEquivalentTo("value", (StringComparison)99));
            Assert.Equal("comparison", invalid.ParamName);
            Assert.Null(invalid.ActualValue);
        }
        finally
        {
            CultureInfo.CurrentCulture = originalCulture;
        }
    }

    [Fact]
    public void WildcardMatchingCoversTheWholeStringIncludingNewlines()
    {
        "hello\r\nworld!".Should().Match("hello*world?");
        "x\ny".Should().Match("x?y");
        "*ba".Should().Match("*a");
        "a*b*c".Should().Match("a**c");
        "".Should().Match("*");
        Assert.Throws<AstraFlowAssertionException>(() => "prefix-value-suffix".Should().Match("value"));
        Assert.Throws<AstraFlowAssertionException>(() => "Case".Should().Match("case"));
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().Match("*"));

        var nullPattern = Assert.Throws<ArgumentNullException>(() => "value".Should().Match(null!));
        Assert.Equal("pattern", nullPattern.ParamName);
        var emptyPattern = Assert.Throws<ArgumentException>(() => "value".Should().Match(string.Empty));
        Assert.Equal("pattern", emptyPattern.ParamName);
        Assert.Null(emptyPattern.InnerException);
        Assert.DoesNotContain("value", emptyPattern.Message);
    }

    [Fact]
    public void RegexMatchingUsesSafePatternErrorsAndARequiredTimeout()
    {
        "prefix-123-suffix".Should().MatchRegex("\\d+", TimeSpan.FromSeconds(1));
        Assert.Throws<AstraFlowAssertionException>(() => "value".Should().MatchRegex("^other$", TimeSpan.FromSeconds(1)));
        Assert.Throws<AstraFlowAssertionException>(() => ((string?)null).Should().MatchRegex(".*", TimeSpan.FromSeconds(1)));

        var malformed = Assert.Throws<ArgumentException>(() => "value".Should().MatchRegex("secret-[", TimeSpan.FromSeconds(1)));
        Assert.Equal("pattern", malformed.ParamName);
        Assert.Null(malformed.InnerException);
        Assert.DoesNotContain("secret-[", malformed.Message);

        var nullPattern = Assert.Throws<ArgumentNullException>(() => "value".Should().MatchRegex(null!, TimeSpan.FromSeconds(1)));
        Assert.Equal("pattern", nullPattern.ParamName);
        var emptyPattern = Assert.Throws<ArgumentException>(() => "value".Should().MatchRegex(string.Empty, TimeSpan.FromSeconds(1)));
        Assert.Equal("pattern", emptyPattern.ParamName);
        Assert.Null(emptyPattern.InnerException);

        foreach (var timeout in new[] { TimeSpan.Zero, TimeSpan.FromTicks(-1), Regex.InfiniteMatchTimeout, TimeSpan.MaxValue })
        {
            var invalid = Assert.Throws<ArgumentOutOfRangeException>(() => "value".Should().MatchRegex(".*", timeout));
            Assert.Equal("timeout", invalid.ParamName);
            Assert.Null(invalid.ActualValue);
            Assert.Null(invalid.InnerException);
        }

        var validationOrder = Assert.Throws<ArgumentOutOfRangeException>(() => "value".Should().MatchRegex(null!, TimeSpan.Zero));
        Assert.Equal("timeout", validationOrder.ParamName);
    }

    [Fact]
    public void RegexTimeoutAndAssertionFailuresDoNotRevealSubjectOrPattern()
    {
        var subject = new string('a', 128) + "!";
        var timeout = Assert.Throws<AstraFlowAssertionException>(() => subject.Should().MatchRegex("^(a+)+$", TimeSpan.FromMilliseconds(1)));
        Assert.DoesNotContain(subject, timeout.Message);
        Assert.DoesNotContain("^(a+)+$", timeout.Message);

        var mismatch = Assert.Throws<AstraFlowAssertionException>(() => "private-subject".Should().MatchRegex("private-pattern", TimeSpan.FromSeconds(1)));
        Assert.DoesNotContain("private-subject", mismatch.Message);
        Assert.DoesNotContain("private-pattern", mismatch.Message);
    }

    [Fact]
    public void ObjectPredicatesValidateCallbacksPropagateExceptionsAndKeepValuesPrivate()
    {
        int value = 7;
        var assertions = value.Should();
        var calls = 0;
        assertions.Match(actual => { calls++; return actual == 7; });
        assertions.NotMatch(actual => { calls++; return actual < 0; });
        Assert.Equal(2, calls);

        var matchFailure = Assert.Throws<AstraFlowAssertionException>(() => ((object)"private-value").Should().Match(actual => actual is string text && text.Length == 0));
        Assert.DoesNotContain("private-value", matchFailure.Message);
        var notMatchFailure = Assert.Throws<AstraFlowAssertionException>(() => 7.Should().NotMatch(actual => actual == 7));
        Assert.DoesNotContain("7", notMatchFailure.Message);

        ObjectAssertions<int> typed = 1.Should();
        Assert.Equal("predicate", Assert.Throws<ArgumentNullException>(() => typed.Match(null!)).ParamName);
        Assert.Equal("predicate", Assert.Throws<ArgumentNullException>(() => typed.NotMatch(null!)).ParamName);

        var expected = new InvalidOperationException("callback failure");
        var observed = Assert.Throws<InvalidOperationException>(() => 1.Should().Match(_ => throw expected));
        Assert.Same(expected, observed);
    }

    [Fact]
    public void EnumNotBeDefinedDistinguishesDeclaredValuesAndKeepsDiagnosticsPrivate()
    {
        var undefined = ((DayOfWeek)99).Should();
        Assert.Same(undefined, undefined.NotBeDefined());
        Assert.Throws<AstraFlowAssertionException>(() => DayOfWeek.Monday.Should().NotBeDefined());
        Assert.Throws<AstraFlowAssertionException>(() => SmallFlags.First.Should().NotBeDefined());
        (SmallFlags.First | SmallFlags.Second).Should().NotBeDefined();

        SmallFlags.First.Should().NotHaveFlag(SmallFlags.First | SmallFlags.Second);
        Assert.Throws<AstraFlowAssertionException>(() => SmallFlags.First.Should().NotHaveFlag(SmallFlags.First));

        var failure = Assert.Throws<AstraFlowAssertionException>(() => DayOfWeek.Sunday.Should().NotBeDefined());
        Assert.DoesNotContain("Sunday", failure.Message);

        ObjectAssertions<DayOfWeek> assertions = null!;
        var nullReceiver = Assert.Throws<ArgumentNullException>(() => assertions.NotBeDefined());
        Assert.Equal("assertions", nullReceiver.ParamName);
    }

    [Flags]
    private enum SmallFlags : byte
    {
        None = 0,
        First = 1,
        Second = 2
    }
}
