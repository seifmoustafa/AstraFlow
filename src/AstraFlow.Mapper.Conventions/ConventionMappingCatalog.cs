namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Holds opt-in convention mapping profiles and direct mapping pair registrations.
/// </summary>
public sealed class ConventionMappingCatalog
{
    private readonly List<ConventionMappingDefinition> _definitions = [];

    internal IReadOnlyList<ConventionMappingDefinition> Definitions => _definitions;

    /// <summary>
    /// Adds a convention profile instance.
    /// </summary>
    /// <param name="profile">The profile to add.</param>
    /// <returns>The same catalog for chaining.</returns>
    public ConventionMappingCatalog AddProfile(ConventionMappingProfile profile)
    {
        if (profile is null)
            throw new ArgumentNullException(nameof(profile));

        _definitions.AddRange(profile.Definitions);
        return this;
    }

    /// <summary>
    /// Adds a convention profile by type.
    /// </summary>
    /// <typeparam name="TProfile">The profile type.</typeparam>
    /// <returns>The same catalog for chaining.</returns>
    public ConventionMappingCatalog AddProfile<TProfile>()
        where TProfile : ConventionMappingProfile, new()
    {
        return AddProfile(new TProfile());
    }

    /// <summary>
    /// Registers one exact source/destination mapping pair without a profile class.
    /// </summary>
    /// <typeparam name="TSource">The source type.</typeparam>
    /// <typeparam name="TDestination">The destination type.</typeparam>
    /// <returns>A mapping expression for include, ignore, and sensitive-member policy.</returns>
    public ConventionMappingExpression<TSource, TDestination> CreateMap<TSource, TDestination>()
    {
        var definition = new ConventionMappingDefinition(typeof(TSource), typeof(TDestination));
        _definitions.Add(definition);
        return new ConventionMappingExpression<TSource, TDestination>(definition, _definitions.Add);
    }
}
