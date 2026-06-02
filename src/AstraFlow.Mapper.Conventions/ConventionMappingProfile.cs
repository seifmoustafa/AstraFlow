namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Base class for opt-in convention mapping profiles.
/// </summary>
public abstract class ConventionMappingProfile
{
    private readonly List<ConventionMappingDefinition> _definitions = [];
    private readonly List<ConventionValueTransformerDefinition> _valueTransformers = [];

    internal IReadOnlyList<ConventionMappingDefinition> Definitions => _definitions;

    internal IReadOnlyList<ConventionValueTransformerDefinition> ValueTransformers => _valueTransformers;

    /// <summary>
    /// Registers an exact source/destination mapping pair for convention mapping.
    /// </summary>
    /// <typeparam name="TSource">The source type.</typeparam>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <returns>A mapping expression for include, ignore, and sensitive-member policy.</returns>
    protected ConventionMappingExpression<TSource, TDestination> CreateMap<TSource, TDestination>()
    {
        var definition = new ConventionMappingDefinition(typeof(TSource), typeof(TDestination), _valueTransformers);
        _definitions.Add(definition);
        return new ConventionMappingExpression<TSource, TDestination>(definition, _definitions.Add);
    }

    /// <summary>
    /// Adds a convention value transformer for this profile.
    /// </summary>
    /// <typeparam name="TValue">The transformed value type.</typeparam>
    /// <param name="transformer">The transformer callback.</param>
    protected void AddValueTransformer<TValue>(Func<TValue?, TValue?> transformer)
    {
        if (transformer is null)
            throw new ArgumentNullException(nameof(transformer));

        _valueTransformers.Add(new ConventionValueTransformerDefinition(
            typeof(TValue),
            value => transformer((TValue?)value)));
    }
}
