using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for AstraFlow projection tests.
/// </summary>
public static class ProjectionAssertions
{
    /// <summary>
    /// Asserts that an unnamed projection can be resolved.
    /// </summary>
    public static IProjection<TSource, TDestination> ShouldResolveProjection<TSource, TDestination>(
        this IProjectionRegistry registry)
    {
        if (registry is null)
        {
            throw new ArgumentNullException(nameof(registry));
        }

        if (!registry.TryGet<TSource, TDestination>(out var projection))
        {
            throw new AstraFlowAssertionException(
                $"Expected projection '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}' to resolve, but it was missing or ambiguous.");
        }

        return projection;
    }

    /// <summary>
    /// Asserts that a named projection can be resolved.
    /// </summary>
    public static IProjection<TSource, TDestination> ShouldResolveProjection<TSource, TDestination>(
        this IProjectionRegistry registry,
        string name)
    {
        if (registry is null)
        {
            throw new ArgumentNullException(nameof(registry));
        }

        if (!registry.TryGet<TSource, TDestination>(name, out var projection))
        {
            throw new AstraFlowAssertionException(
                $"Expected projection '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}' named '{name}' to resolve, but it was missing or ambiguous.");
        }

        return projection;
    }

    /// <summary>
    /// Asserts that projection validation has no findings.
    /// </summary>
    public static ProjectionValidationReport ShouldHaveNoProjectionFindings(
        this IProjectionValidator validator,
        MappingOptions? options = null)
    {
        if (validator is null)
        {
            throw new ArgumentNullException(nameof(validator));
        }

        var report = validator.Validate(options ?? new MappingOptions());
        if (report.HasFindings)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection validation to have no findings, but found {report.Findings.Count}.");
        }

        return report;
    }

    /// <summary>
    /// Asserts that projection validation contains at least one finding with the supplied code.
    /// </summary>
    public static ProjectionValidationFinding ShouldHaveProjectionFinding(
        this ProjectionValidationReport report,
        string code)
    {
        if (report is null)
        {
            throw new ArgumentNullException(nameof(report));
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Finding code is required.", nameof(code));
        }

        var finding = report.Findings.FirstOrDefault(candidate => candidate.Code == code);
        if (finding is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection validation finding '{code}', but it was not present.");
        }

        return finding;
    }
}
