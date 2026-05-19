namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Provides opt-in convention mapping operations that are intentionally separate from the core mapper contract.
/// </summary>
public interface IConventionMapper
{
    /// <summary>
    /// Maps a source object to a new destination instance using a registered convention pair.
    /// </summary>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <param name="source">The source object.</param>
    /// <returns>The mapped destination value.</returns>
    TDestination Map<TDestination>(object? source);

    /// <summary>
    /// Maps a source object into an existing destination instance using an explicitly enabled update mapping pair.
    /// </summary>
    /// <typeparam name="TSource">The source type.</typeparam>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <param name="source">The source object.</param>
    /// <param name="destination">The destination instance to update.</param>
    /// <returns>The same destination instance after mapping.</returns>
    TDestination MapInto<TSource, TDestination>(TSource? source, TDestination destination)
        where TDestination : class;
}

