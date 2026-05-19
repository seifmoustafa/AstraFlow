namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Base class for opt-in convention mapping profiles.
/// </summary>
public abstract class ConventionMappingProfile
{
    private readonly List<ConventionMappingDefinition> _definitions = [];

    internal IReadOnlyList<ConventionMappingDefinition> Definitions => _definitions;

    /// <summary>
    /// Registers an exact source/destination mapping pair for convention mapping.
    /// </summary>
    /// <typeparam name="TSource">The source type.</typeparam>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <returns>A mapping expression for include, ignore, and sensitive-member policy.</returns>
    protected ConventionMappingExpression<TSource, TDestination> CreateMap<TSource, TDestination>()
    {
        var definition = new ConventionMappingDefinition(typeof(TSource), typeof(TDestination));
        _definitions.Add(definition);
        return new ConventionMappingExpression<TSource, TDestination>(definition);
    }
}
