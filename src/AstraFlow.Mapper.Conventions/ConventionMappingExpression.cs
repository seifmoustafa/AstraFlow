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
    private readonly Action<ConventionMappingDefinition> _addDefinition;

    internal ConventionMappingExpression(
        ConventionMappingDefinition definition,
        Action<ConventionMappingDefinition> addDefinition)
    {
        _definition = definition;
        _addDefinition = addDefinition;
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
    /// Enables opt-in flattening from nested source members to flat destination members.
    /// </summary>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> EnableFlattening()
    {
        _definition.FlatteningEnabled = true;
        return this;
    }

    /// <summary>
    /// Enables opt-in unflattening from flat source members to nested destination paths.
    /// </summary>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> EnableUnflattening()
    {
        _definition.UnflatteningEnabled = true;
        return this;
    }

    /// <summary>
    /// Includes child source members when matching destination members.
    /// </summary>
    /// <param name="sourceMembers">The source members whose child properties may be matched.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> IncludeMembers(
        params Expression<Func<TSource, object?>>[] sourceMembers)
    {
        if (sourceMembers is null)
            throw new ArgumentNullException(nameof(sourceMembers));

        foreach (var sourceMember in sourceMembers)
        {
            var property = GetProperty(sourceMember, nameof(sourceMembers));
            _definition.IncludeSourceMember(property.Name);
        }

        return this;
    }

    /// <summary>
    /// Adds an explicit reverse mapping pair. Reverse mapping is never implicit.
    /// </summary>
    /// <param name="configure">Optional reverse mapping configuration.</param>
    /// <returns>The reverse mapping expression.</returns>
    public ConventionMappingExpression<TDestination, TSource> ReverseMap(
        Action<ConventionMappingExpression<TDestination, TSource>>? configure = null)
    {
        var reverseDefinition = new ConventionMappingDefinition(typeof(TDestination), typeof(TSource))
        {
            ExplicitReverseMapping = true
        };
        _addDefinition(reverseDefinition);
        var reverseExpression = new ConventionMappingExpression<TDestination, TSource>(
            reverseDefinition,
            _addDefinition);
        configure?.Invoke(reverseExpression);
        return reverseExpression;
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

    /// <summary>
    /// Configures a nested destination member path.
    /// </summary>
    /// <typeparam name="TDestinationMember">The destination member type.</typeparam>
    /// <param name="destinationPath">The destination member path.</param>
    /// <param name="configure">The member configuration callback.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMappingExpression<TSource, TDestination> ForPath<TDestinationMember>(
        Expression<Func<TDestination, TDestinationMember>> destinationPath,
        Action<ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember>> configure)
    {
        if (configure is null)
            throw new ArgumentNullException(nameof(configure));

        var path = GetPropertyPath(destinationPath, nameof(destinationPath));
        var memberDefinition = _definition.ConfigureMember(path);
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

    private static string GetPropertyPath<TDeclaring, TMember>(
        Expression<Func<TDeclaring, TMember>> expression,
        string parameterName)
    {
        if (expression is null)
            throw new ArgumentNullException(parameterName);

        Expression body = expression.Body is UnaryExpression unary && unary.NodeType == ExpressionType.Convert
            ? unary.Operand
            : expression.Body;

        var members = new Stack<string>();
        while (body is MemberExpression { Member: PropertyInfo property } member)
        {
            members.Push(property.Name);
            body = member.Expression!;
        }

        if (members.Count == 0 || body.NodeType != ExpressionType.Parameter)
            throw new ArgumentException("Expression must select a public property path.", parameterName);

        return string.Join(".", members);
    }
}
