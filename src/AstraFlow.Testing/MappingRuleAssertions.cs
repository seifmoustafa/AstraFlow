using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for explicit AstraFlow mapping rules.
/// </summary>
public static class MappingRuleAssertions
{
    /// <summary>
    /// Asserts that a rule declares a mapping pair.
    /// </summary>
    public static ObjectMappingPair ShouldDeclare<TSource, TDestination>(
        this IDeclaredObjectMappingRule rule)
    {
        if (rule is null)
        {
            throw new ArgumentNullException(nameof(rule));
        }

        var expected = ObjectMappingPair.Create<TSource, TDestination>();
        if (!rule.DeclaredMappings.Contains(expected))
        {
            throw new AstraFlowAssertionException(
                $"Expected mapping rule '{rule.GetType().FullName}' to declare '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}'.");
        }

        return expected;
    }

    /// <summary>
    /// Asserts that a rule owns a source/destination mapping pair.
    /// </summary>
    public static void ShouldOwnMapping<TSource, TDestination>(
        this IObjectMappingRule rule)
    {
        if (rule is null)
        {
            throw new ArgumentNullException(nameof(rule));
        }

        if (!rule.CanMap(typeof(TSource), typeof(TDestination)))
        {
            throw new AstraFlowAssertionException(
                $"Expected mapping rule '{rule.GetType().FullName}' to own '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}'.");
        }
    }
}
