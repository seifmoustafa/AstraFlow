namespace AstraFlow.Mapper;

/// <summary>
/// Represents an explicitly named projection. Named projections allow multiple read-model shapes
/// for the same source and destination types without relying on registration order.
/// </summary>
/// <typeparam name="TSource">The source query element type.</typeparam>
/// <typeparam name="TDestination">The projected DTO type.</typeparam>
public interface INamedProjection<TSource, TDestination> : IProjection<TSource, TDestination>
{
    /// <summary>
    /// Gets the unique projection name within the source/destination pair.
    /// </summary>
    string Name { get; }
}
