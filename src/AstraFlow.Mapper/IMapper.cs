namespace AstraFlow.Mapper;

/// <summary>
/// Provides AstraFlow-owned object mapping for application handlers without depending on
/// runtime mapping packages. Implementations are expected to use explicit mapping rules
/// so DTO shape changes remain auditable in source code.
/// </summary>
public interface IMapper
{
    /// <summary>
    /// Maps <paramref name="source"/> to <typeparamref name="TDestination"/>.
    /// </summary>
    /// <typeparam name="TDestination">The destination DTO or model type.</typeparam>
    /// <param name="source">The source object. Null sources return the destination default value.</param>
    /// <returns>The mapped destination value.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when no explicit mapping rule can map the source type to the destination type.
    /// </exception>
    TDestination Map<TDestination>(object? source);

    /// <summary>
    /// Maps <paramref name="source"/> to a runtime destination type.
    /// </summary>
    /// <param name="source">The source object. Null sources return null.</param>
    /// <param name="destinationType">The destination DTO or model type.</param>
    /// <returns>The mapped destination value, or null when the source is null.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when no explicit mapping rule can map the source type to <paramref name="destinationType"/>.
    /// </exception>
    object? Map(object? source, Type destinationType);
}
