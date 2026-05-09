namespace AstraFlow.Mapper;

/// <summary>
/// Describes one explicit source-to-destination mapping rule used by the AstraFlow mapper.
/// A rule may cover a single pair or a tightly related group of DTO mappings inside a module.
/// </summary>
public interface IObjectMappingRule
{
    /// <summary>
    /// Determines whether this rule can map the specified source and destination types.
    /// </summary>
    /// <param name="sourceType">The concrete runtime source type.</param>
    /// <param name="destinationType">The requested destination type.</param>
    /// <returns>True when this rule owns the mapping; otherwise false.</returns>
    bool CanMap(Type sourceType, Type destinationType);

    /// <summary>
    /// Maps the source object to the requested destination type.
    /// </summary>
    /// <param name="source">The source object to map.</param>
    /// <param name="destinationType">The requested destination type.</param>
    /// <param name="mapper">The mapper facade for nested mappings.</param>
    /// <returns>The mapped destination value.</returns>
    /// <exception cref="InvalidCastException">
    /// May be thrown by implementations when <paramref name="source"/> does not match the expected source type.
    /// </exception>
    object? Map(object? source, Type destinationType, IMapper mapper);
}
