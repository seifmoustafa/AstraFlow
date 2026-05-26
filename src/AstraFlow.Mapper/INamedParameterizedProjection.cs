namespace AstraFlow.Mapper;

/// <summary>
/// Adds an explicit name to a parameterized projection when one source/destination/parameter tuple has multiple shapes.
/// </summary>
/// <typeparam name="TSource">The source query element type.</typeparam>
/// <typeparam name="TDestination">The projected DTO type.</typeparam>
/// <typeparam name="TParameters">The projection parameter object type.</typeparam>
public interface INamedParameterizedProjection<TSource, TDestination, TParameters>
    : IParameterizedProjection<TSource, TDestination, TParameters>
{
    /// <summary>
    /// Gets the projection name.
    /// </summary>
    string Name { get; }
}
