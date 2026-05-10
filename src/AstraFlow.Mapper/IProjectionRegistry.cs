namespace AstraFlow.Mapper;

/// <summary>
/// Resolves registered projections by source/destination pair and optional projection name.
/// </summary>
public interface IProjectionRegistry
{
    /// <summary>
    /// Gets all projection registrations visible to the registry.
    /// </summary>
    IReadOnlyList<ProjectionRegistration> Registrations { get; }

    /// <summary>
    /// Gets the only unnamed projection for the requested source/destination pair.
    /// </summary>
    IProjection<TSource, TDestination> Get<TSource, TDestination>();

    /// <summary>
    /// Gets the named projection for the requested source/destination pair.
    /// </summary>
    IProjection<TSource, TDestination> Get<TSource, TDestination>(string name);

    /// <summary>
    /// Attempts to get the only unnamed projection for the requested source/destination pair.
    /// </summary>
    bool TryGet<TSource, TDestination>(out IProjection<TSource, TDestination> projection);

    /// <summary>
    /// Attempts to get the named projection for the requested source/destination pair.
    /// </summary>
    bool TryGet<TSource, TDestination>(string name, out IProjection<TSource, TDestination> projection);
}
