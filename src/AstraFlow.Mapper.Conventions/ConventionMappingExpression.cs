namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Configures one convention mapping pair.
/// </summary>
/// <typeparam name="TSource">The source type.</typeparam>
/// <typeparam name="TDestination">The destination type.</typeparam>
public sealed class ConventionMappingExpression<TSource, TDestination>
{
    private readonly ConventionMappingDefinition _definition;

    internal ConventionMappingExpression(ConventionMappingDefinition definition)
    {
        _definition = definition;
    }

    /// <summary>
    /// Enables case-insensitive member matching for this mapping pair.
    /// </summary>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> UseCaseInsensitiveMemberMatching()
    {
        _definition.AllowCaseInsensitiveMemberMatching = true;
        return this;
    }

    /// <summary>
    /// Adds an allow-list destination member. When any include is configured, only included destination members are mapped.
    /// </summary>
    /// <param name="destinationMemberName">The destination member name.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> Include(string destinationMemberName)
    {
        _definition.Include(destinationMemberName);
        return this;
    }

    /// <summary>
    /// Ignores a destination member.
    /// </summary>
    /// <param name="destinationMemberName">The destination member name.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> Ignore(string destinationMemberName)
    {
        _definition.Ignore(destinationMemberName);
        return this;
    }

    /// <summary>
    /// Explicitly allows a sensitive source or destination member to be mapped.
    /// </summary>
    /// <param name="memberName">The source or destination member name.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> AllowSensitiveMember(string memberName)
    {
        _definition.AllowSensitiveMember(memberName);
        return this;
    }
}
