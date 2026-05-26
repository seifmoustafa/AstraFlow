namespace AstraFlow.Mapper;

/// <summary>
/// Resolves registered parameterized projections by source type, destination type, parameter type, and optional name.
/// </summary>
public interface IParameterizedProjectionRegistry
{
    /// <summary>
    /// Gets the registered projection descriptors.
    /// </summary>
    IReadOnlyList<ProjectionRegistration> Registrations { get; }

    /// <summary>
    /// Resolves the only unnamed parameterized projection for a source/destination/parameter tuple.
    /// </summary>
    IParameterizedProjection<TSource, TDestination, TParameters> GetParameterized<TSource, TDestination, TParameters>();

    /// <summary>
    /// Resolves a named parameterized projection for a source/destination/parameter tuple.
    /// </summary>
    IParameterizedProjection<TSource, TDestination, TParameters> GetParameterized<TSource, TDestination, TParameters>(string name);

    /// <summary>
    /// Attempts to resolve the only unnamed parameterized projection for a source/destination/parameter tuple.
    /// </summary>
    bool TryGetParameterized<TSource, TDestination, TParameters>(
        out IParameterizedProjection<TSource, TDestination, TParameters> projection);

    /// <summary>
    /// Attempts to resolve a named parameterized projection for a source/destination/parameter tuple.
    /// </summary>
    bool TryGetParameterized<TSource, TDestination, TParameters>(
        string name,
        out IParameterizedProjection<TSource, TDestination, TParameters> projection);
}
