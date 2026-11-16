using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace AstraFlow.Assertions;

/// <summary>Assertions about CLR type structure and public members.</summary>
public sealed class TypeAssertions
{
    private const BindingFlags PublicMembers = BindingFlags.Instance | BindingFlags.Static | BindingFlags.Public | BindingFlags.FlattenHierarchy;
    private readonly Type? _actual;

    internal TypeAssertions(Type? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public TypeAssertions And => this;

    /// <summary>Gets the type being asserted.</summary>
    public Type? Subject => _actual;

    /// <summary>Asserts that the subject is the specified runtime type.</summary>
    /// <param name="expected">The expected runtime type, or null.</param>
    public TypeAssertions Be(Type? expected)
    {
        if (_actual != expected)
        {
            AssertionFailure.Fail("Expected the subject type to equal the specified type.");
        }

        return this;
    }

    /// <summary>Asserts that the subject is not the specified runtime type.</summary>
    /// <param name="unexpected">The runtime type the subject must not equal, or null.</param>
    public TypeAssertions NotBe(Type? unexpected)
    {
        if (_actual == unexpected)
        {
            AssertionFailure.Fail("Expected the subject type not to equal the specified type.");
        }

        return this;
    }

    /// <summary>Asserts that the type subject is null.</summary>
    public TypeAssertions BeNull() => BeNull(null);

    /// <summary>Asserts that the type subject is null and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public TypeAssertions BeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is not null)
        {
            AssertionFailure.FailWithBecause("Expected a null type subject.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the type exists.</summary>
    public TypeAssertions NotBeNull() => NotBeNull(null);

    /// <summary>Asserts that the type exists and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public TypeAssertions NotBeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is null)
        {
            AssertionFailure.FailWithBecause("Expected a type, but the subject was null.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the type is sealed.</summary>
    public TypeAssertions BeSealed()
    {
        if (!RequireSubject().IsSealed)
        {
            AssertionFailure.Fail("Expected the type to be sealed.");
        }

        return this;
    }

    /// <summary>Asserts that the type is not sealed.</summary>
    public TypeAssertions NotBeSealed()
    {
        if (RequireSubject().IsSealed)
        {
            AssertionFailure.Fail("Expected the type not to be sealed.");
        }

        return this;
    }

    /// <summary>Asserts that the type is abstract.</summary>
    public TypeAssertions BeAbstract()
    {
        if (!RequireSubject().IsAbstract)
        {
            AssertionFailure.Fail("Expected the type to be abstract.");
        }

        return this;
    }

    /// <summary>Asserts that the type is not abstract.</summary>
    public TypeAssertions NotBeAbstract()
    {
        if (RequireSubject().IsAbstract)
        {
            AssertionFailure.Fail("Expected the type not to be abstract.");
        }

        return this;
    }

    /// <summary>Asserts that the type is static.</summary>
    public TypeAssertions BeStatic()
    {
        var type = RequireSubject();
        if (!type.IsAbstract || !type.IsSealed)
        {
            AssertionFailure.Fail("Expected the type to be static.");
        }

        return this;
    }

    /// <summary>Asserts that the type is not static.</summary>
    public TypeAssertions NotBeStatic()
    {
        var type = RequireSubject();
        if (type.IsAbstract && type.IsSealed)
        {
            AssertionFailure.Fail("Expected the type not to be static.");
        }

        return this;
    }

    /// <summary>Asserts that the type implements the requested interface.</summary>
    /// <typeparam name="TInterface">The interface type to check.</typeparam>
    public TypeAssertions Implement<TInterface>() => Implement(typeof(TInterface));

    /// <summary>Asserts that the type implements the requested interface.</summary>
    /// <param name="interfaceType">An interface type.</param>
    public TypeAssertions Implement(Type interfaceType)
    {
        ValidateInterfaceType(interfaceType);
        if (!interfaceType.IsAssignableFrom(RequireSubject()))
        {
            AssertionFailure.Fail("Expected the type to implement the requested interface.");
        }

        return this;
    }

    /// <summary>Asserts that the type does not implement the requested interface.</summary>
    /// <typeparam name="TInterface">The interface type to check.</typeparam>
    public TypeAssertions NotImplement<TInterface>() => NotImplement(typeof(TInterface));

    /// <summary>Asserts that the type does not implement the requested interface.</summary>
    /// <param name="interfaceType">An interface type.</param>
    public TypeAssertions NotImplement(Type interfaceType)
    {
        ValidateInterfaceType(interfaceType);
        if (interfaceType.IsAssignableFrom(RequireSubject()))
        {
            AssertionFailure.Fail("Expected the type not to implement the requested interface.");
        }

        return this;
    }

    /// <summary>Asserts that the type derives from the requested base class.</summary>
    /// <typeparam name="TBase">The base class to check.</typeparam>
    public TypeAssertions BeDerivedFrom<TBase>() => BeDerivedFrom(typeof(TBase));

    /// <summary>Asserts that the type derives from the requested base class.</summary>
    /// <param name="baseType">A non-interface base type.</param>
    public TypeAssertions BeDerivedFrom(Type baseType)
    {
        ValidateBaseType(baseType);
        var type = RequireSubject();
        if (!type.IsSubclassOf(baseType))
        {
            AssertionFailure.Fail("Expected the type to derive from the requested base class.");
        }

        return this;
    }

    /// <summary>Asserts that the type does not derive from the requested base class.</summary>
    /// <typeparam name="TBase">The base class to check.</typeparam>
    public TypeAssertions NotBeDerivedFrom<TBase>() => NotBeDerivedFrom(typeof(TBase));

    /// <summary>Asserts that the type does not derive from the requested base class.</summary>
    /// <param name="baseType">A non-interface base type.</param>
    public TypeAssertions NotBeDerivedFrom(Type baseType)
    {
        ValidateBaseType(baseType);
        var type = RequireSubject();
        if (type.IsSubclassOf(baseType))
        {
            AssertionFailure.Fail("Expected the type not to derive from the requested base class.");
        }

        return this;
    }

    /// <summary>Asserts that the type has a public non-indexed property with the requested name.</summary>
    /// <param name="propertyName">The exact property name.</param>
    public TypeAssertions HaveProperty(string propertyName)
    {
        ValidateMemberName(propertyName, nameof(propertyName));
        if (!FindProperties(propertyName).Any())
        {
            AssertionFailure.Fail("Expected the type to have the requested public property.");
        }

        return this;
    }

    /// <summary>Asserts that the type has a public non-indexed property with the requested name and exact property type.</summary>
    /// <param name="propertyName">The exact property name.</param>
    /// <param name="propertyType">The required property type.</param>
    public TypeAssertions HaveProperty(string propertyName, Type propertyType)
    {
        ValidateMemberName(propertyName, nameof(propertyName));
        if (propertyType is null)
        {
            throw new ArgumentNullException(nameof(propertyType));
        }

        if (!FindProperties(propertyName).Any(property => property.PropertyType == propertyType))
        {
            AssertionFailure.Fail("Expected the type to have the requested public property with the specified type.");
        }

        return this;
    }

    /// <summary>Asserts that the type does not have a public non-indexed property with the requested name.</summary>
    /// <param name="propertyName">The exact property name.</param>
    public TypeAssertions NotHaveProperty(string propertyName)
    {
        ValidateMemberName(propertyName, nameof(propertyName));
        if (FindProperties(propertyName).Any())
        {
            AssertionFailure.Fail("Expected the type not to have the requested public property.");
        }

        return this;
    }

    /// <summary>Asserts that the type has a public method with the requested name and parameter types.</summary>
    /// <param name="methodName">The exact method name.</param>
    /// <param name="parameterTypes">The exact parameter types in declaration order.</param>
    public TypeAssertions HaveMethod(string methodName, params Type[] parameterTypes)
    {
        ValidateMemberName(methodName, nameof(methodName));
        ValidateParameterTypes(parameterTypes, nameof(parameterTypes));
        if (!FindMethods(methodName).Any(method => HasParameters(method, parameterTypes)))
        {
            AssertionFailure.Fail("Expected the type to have the requested public method overload.");
        }

        return this;
    }

    /// <summary>Asserts that the type does not have a public method overload with the requested name and parameter types.</summary>
    /// <param name="methodName">The exact method name.</param>
    /// <param name="parameterTypes">The exact parameter types in declaration order.</param>
    public TypeAssertions NotHaveMethod(string methodName, params Type[] parameterTypes)
    {
        ValidateMemberName(methodName, nameof(methodName));
        ValidateParameterTypes(parameterTypes, nameof(parameterTypes));
        if (FindMethods(methodName).Any(method => HasParameters(method, parameterTypes)))
        {
            AssertionFailure.Fail("Expected the type not to have the requested public method overload.");
        }

        return this;
    }

    /// <summary>Asserts that the type has a public instance constructor with the requested parameter types.</summary>
    /// <param name="parameterTypes">The exact parameter types in declaration order.</param>
    public TypeAssertions HaveConstructor(params Type[] parameterTypes)
    {
        ValidateParameterTypes(parameterTypes, nameof(parameterTypes));
        if (RequireSubject().GetConstructor(parameterTypes) is null)
        {
            AssertionFailure.Fail("Expected the type to have the requested public constructor.");
        }

        return this;
    }

    /// <summary>Asserts that the type does not have a public instance constructor with the requested parameter types.</summary>
    /// <param name="parameterTypes">The exact parameter types in declaration order.</param>
    public TypeAssertions NotHaveConstructor(params Type[] parameterTypes)
    {
        ValidateParameterTypes(parameterTypes, nameof(parameterTypes));
        if (RequireSubject().GetConstructor(parameterTypes) is not null)
        {
            AssertionFailure.Fail("Expected the type not to have the requested public constructor.");
        }

        return this;
    }

    private Type RequireSubject()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a type, but the subject was null.");
        }

        return _actual!;
    }

    private IEnumerable<PropertyInfo> FindProperties(string name) =>
        RequireSubject().GetProperties(PublicMembers)
            .Where(property => property.GetIndexParameters().Length == 0
                && string.Equals(property.Name, name, StringComparison.Ordinal));

    private IEnumerable<MethodInfo> FindMethods(string name) =>
        RequireSubject().GetMethods(PublicMembers)
            .Where(method => string.Equals(method.Name, name, StringComparison.Ordinal));

    private static bool HasParameters(MethodBase method, Type[] parameterTypes) =>
        method.GetParameters().Select(parameter => parameter.ParameterType).SequenceEqual(parameterTypes);

    private static void ValidateInterfaceType(Type interfaceType)
    {
        if (interfaceType is null)
        {
            throw new ArgumentNullException(nameof(interfaceType));
        }

        if (!interfaceType.IsInterface)
        {
            throw new ArgumentException("The requested type must be an interface.", nameof(interfaceType));
        }
    }

    private static void ValidateBaseType(Type baseType)
    {
        if (baseType is null)
        {
            throw new ArgumentNullException(nameof(baseType));
        }

        if (baseType.IsInterface || baseType.IsValueType)
        {
            throw new ArgumentException("The requested type must be a reference type, not an interface.", nameof(baseType));
        }
    }

    private static void ValidateMemberName(string name, string parameterName)
    {
        if (name is null)
        {
            throw new ArgumentNullException(parameterName);
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("A member name is required.", parameterName);
        }
    }

    private static void ValidateParameterTypes(Type[] parameterTypes, string parameterName)
    {
        if (parameterTypes is null)
        {
            throw new ArgumentNullException(parameterName);
        }

        if (parameterTypes.Any(type => type is null))
        {
            throw new ArgumentException("Parameter type entries cannot be null.", parameterName);
        }
    }
}
