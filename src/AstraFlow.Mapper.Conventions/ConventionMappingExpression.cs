using System.Linq.Expressions;
using System.Reflection;

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

    /// <summary>
    /// Enables explicit mapping into an existing destination instance for this pair.
    /// </summary>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> EnableUpdateMapping()
    {
        _definition.UpdateMappingEnabled = true;
        return this;
    }

    /// <summary>
    /// Configures one destination member with explicit source, converter, null, condition, or required-member rules.
    /// </summary>
    /// <typeparam name="TDestinationMember">The destination member type.</typeparam>
    /// <param name="destinationMember">The destination member expression.</param>
    /// <param name="configure">The member configuration callback.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> ForMember<TDestinationMember>(
        Expression<Func<TDestination, TDestinationMember>> destinationMember,
        Action<ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember>> configure)
    {
        if (configure is null)
            throw new ArgumentNullException(nameof(configure));

        var property = GetProperty(destinationMember, nameof(destinationMember));
        var memberDefinition = _definition.ConfigureMember(property.Name);
        configure(new ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember>(memberDefinition));
        return this;
    }

    private static PropertyInfo GetProperty<TDeclaring, TMember>(
        Expression<Func<TDeclaring, TMember>> expression,
        string parameterName)
    {
        if (expression is null)
            throw new ArgumentNullException(parameterName);

        var body = expression.Body is UnaryExpression unary && unary.NodeType == ExpressionType.Convert
            ? unary.Operand
            : expression.Body;

        if (body is not MemberExpression { Member: PropertyInfo property })
            throw new ArgumentException("Expression must select a public property.", parameterName);

        return property;
    }
}
