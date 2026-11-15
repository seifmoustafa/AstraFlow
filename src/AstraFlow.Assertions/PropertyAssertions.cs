namespace AstraFlow.Assertions;

using System.Linq.Expressions;

/// <summary>Provides typed assertions over the value selected by a property expression.</summary>
/// <typeparam name="TProperty">The property's value type.</typeparam>
public sealed class PropertyAssertions<TProperty>
{
    internal PropertyAssertions(TProperty value) => Which = value;

    /// <summary>Gets the property value for further assertions.</summary>
    public TProperty Which { get; }

    /// <summary>Gets the selected property value as the assertion subject.</summary>
    public TProperty Subject => Which;

    /// <summary>Returns this result for another related check.</summary>
    public PropertyAssertions<TProperty> And => this;
}

/// <summary>Provides strongly typed property selectors when an object is held through the untyped entry point.</summary>
public static class PropertyAssertionExtensions
{
    /// <summary>Gets a property value using a typed selector and returns it for further assertions.</summary>
    /// <typeparam name="TSubject">The expected runtime subject type.</typeparam>
    /// <typeparam name="TProperty">The selected property's value type.</typeparam>
    /// <param name="assertions">Assertions created for the subject.</param>
    /// <param name="property">An instance-property expression rooted at the subject.</param>
    /// <remarks>The selected property chain is evaluated once. Property getter exceptions propagate unchanged.</remarks>
    public static PropertyAssertions<TProperty> HaveProperty<TSubject, TProperty>(
        this ObjectAssertions<object?> assertions,
        Expression<Func<TSubject, TProperty>> property)
        where TSubject : class
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (property is null)
        {
            throw new ArgumentNullException(nameof(property));
        }

        ValidatePropertyExpression(property);
        var actual = assertions.SubjectValue;
        if (actual is not TSubject)
        {
            AssertionFailure.Fail("Expected the subject to have the type required by the property selector.");
        }

        return new PropertyAssertions<TProperty>(property.Compile()((TSubject)actual));
    }

    private static void ValidatePropertyExpression<TSubject, TProperty>(Expression<Func<TSubject, TProperty>> property)
        where TSubject : class
    {
        Expression current = property.Body;
        while (current is UnaryExpression unary
            && (unary.NodeType == ExpressionType.Convert || unary.NodeType == ExpressionType.ConvertChecked))
        {
            current = unary.Operand;
        }

        var foundProperty = false;
        while (current is MemberExpression member)
        {
            if (member.Member is not System.Reflection.PropertyInfo propertyInfo
                || propertyInfo.GetIndexParameters().Length != 0
                || member.Expression is null)
            {
                throw new ArgumentException("The selector must contain only instance property access.", nameof(property));
            }

            foundProperty = true;
            current = member.Expression;
            while (current is UnaryExpression conversion
                && (conversion.NodeType == ExpressionType.Convert || conversion.NodeType == ExpressionType.ConvertChecked))
            {
                current = conversion.Operand;
            }
        }

        if (!foundProperty || current != property.Parameters[0])
        {
            throw new ArgumentException("The selector must be a property path rooted at the subject parameter.", nameof(property));
        }
    }
}
