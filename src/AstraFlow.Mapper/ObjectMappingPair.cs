namespace AstraFlow.Mapper;

/// <summary>
/// Identifies one explicit source-to-destination DTO mapping owned by a NEXORA mapping rule.
/// The pair is used for startup validation, duplicate detection, and architecture tests.
/// </summary>
/// <param name="SourceType">The source domain, persistence, or application model type.</param>
/// <param name="DestinationType">The destination DTO or response model type.</param>
public readonly record struct ObjectMappingPair(Type SourceType, Type DestinationType)
{
    /// <summary>
    /// Creates a strongly typed mapping pair without repeating <see cref="Type"/> expressions at call sites.
    /// </summary>
    /// <typeparam name="TSource">The source type.</typeparam>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <returns>A mapping pair for the supplied generic types.</returns>
    public static ObjectMappingPair Create<TSource, TDestination>() =>
        new(typeof(TSource), typeof(TDestination));

    /// <summary>
    /// Returns a compact display value suitable for diagnostics and build failures.
    /// </summary>
    /// <returns>The source and destination type names.</returns>
    public override string ToString() =>
        $"{SourceType.FullName} -> {DestinationType.FullName}";
}
