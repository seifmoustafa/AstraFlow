using System.Linq.Expressions;
using System.Reflection;

namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Configures one destination member in a convention mapping pair.
/// </summary>
/// <typeparam name="TSource">The source type.</typeparam>
/// <typeparam name="TDestination">The destination type.</typeparam>
/// <typeparam name="TDestinationMember">The destination member type.</typeparam>
public sealed class ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember>
{
    private readonly ConventionMemberMappingDefinition _definition;

    internal ConventionMemberMappingExpression(ConventionMemberMappingDefinition definition)
    {
        _definition = definition;
    }

    /// <summary>
    /// Maps the destination member from an explicitly selected source member.
    /// </summary>
    /// <typeparam name="TSourceMember">The source member type.</typeparam>
    /// <param name="sourceMember">The source member expression.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember> MapFrom<TSourceMember>(
        Expression<Func<TSource, TSourceMember>> sourceMember)
    {
        var property = GetProperty(sourceMember, nameof(sourceMember));
        _definition.SetSourceMember(property.Name, typeof(TSourceMember), sourceMember.Compile());
        return this;
    }

    /// <summary>
    /// Maps the destination member from a source member through an explicit converter.
    /// </summary>
    /// <typeparam name="TSourceMember">The source member type.</typeparam>
    /// <param name="sourceMember">The source member expression.</param>
    /// <param name="converter">The converter to apply.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember> ConvertUsing<TSourceMember>(
        Expression<Func<TSource, TSourceMember>> sourceMember,
        Func<TSourceMember, TDestinationMember> converter)
    {
        if (converter is null)
            throw new ArgumentNullException(nameof(converter));

        var property = GetProperty(sourceMember, nameof(sourceMember));
        _definition.SetConverter(property.Name, typeof(TSourceMember), sourceMember.Compile(), converter);
        return this;
    }

    /// <summary>
    /// Supplies a value when the selected or convention-matched source value is null.
    /// </summary>
    /// <param name="value">The substitute value.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember> NullSubstitute(
        TDestinationMember value)
    {
        _definition.SetNullSubstitute(value);
        return this;
    }

    /// <summary>
    /// Maps this destination member only when the predicate returns true.
    /// </summary>
    /// <param name="predicate">The source predicate.</param>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember> Condition(
        Func<TSource, bool> predicate)
    {
        if (predicate is null)
            throw new ArgumentNullException(nameof(predicate));

        _definition.SetCondition(predicate);
        return this;
    }

    /// <summary>
    /// Marks the destination member as required in the mapping plan.
    /// </summary>
    /// <returns>The same expression for chaining.</returns>
    public ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember> Required()
    {
        _definition.MarkRequired();
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
