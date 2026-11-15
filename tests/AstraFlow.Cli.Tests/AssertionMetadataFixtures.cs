namespace AstraFlow.Cli.Tests.MetadataFixtures;

public sealed class TextAssertions
{
    public void Be(string expected)
    {
    }
}

public static class AssertionExtensions
{
    public static TextAssertions Should(this string actual) => new();
}
