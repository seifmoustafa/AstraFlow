using System;
using System.Reflection;

namespace AstraFlow.Assertions;

/// <summary>Assertions for assembly references and declared types.</summary>
/// <remarks>These checks inspect assembly metadata and do not load referenced assemblies or instantiate types.</remarks>
public sealed class AssemblyAssertions
{
    /// <summary>Gets the assembly being asserted.</summary>
    public Assembly? Subject { get; }

    /// <summary>Returns this assertion object for a related check.</summary>
    public AssemblyAssertions And => this;

    internal AssemblyAssertions(Assembly? subject) => Subject = subject;

    /// <summary>Asserts that the assembly references the supplied assembly by simple name.</summary>
    public AssemblyAssertions Reference(Assembly expectedAssembly)
        => CheckReference(expectedAssembly, shouldReference: true, nameof(expectedAssembly));

    /// <summary>Asserts that the assembly does not reference the supplied assembly by simple name.</summary>
    public AssemblyAssertions NotReference(Assembly unexpectedAssembly)
        => CheckReference(unexpectedAssembly, shouldReference: false, nameof(unexpectedAssembly));

    /// <summary>Asserts that the assembly defines a type with the exact full name.</summary>
    /// <remarks>Type-name matching is case-sensitive and supports nested type names in reflection format.</remarks>
    public AssemblyAssertions HaveType(string fullName)
        => CheckTypeName(fullName, shouldExist: true);

    /// <summary>Asserts that the assembly does not define a type with the exact full name.</summary>
    /// <remarks>Type-name matching is case-sensitive and supports nested type names in reflection format.</remarks>
    public AssemblyAssertions NotHaveType(string fullName)
        => CheckTypeName(fullName, shouldExist: false);

    /// <summary>Asserts that the supplied runtime type is defined by this assembly.</summary>
    public AssemblyAssertions HaveType(Type expectedType)
        => CheckType(expectedType, shouldExist: true, nameof(expectedType));

    /// <summary>Asserts that the supplied runtime type is not defined by this assembly.</summary>
    public AssemblyAssertions NotHaveType(Type unexpectedType)
        => CheckType(unexpectedType, shouldExist: false, nameof(unexpectedType));

    private AssemblyAssertions CheckReference(Assembly? expectedAssembly, bool shouldReference, string parameterName)
    {
        if (expectedAssembly is null)
        {
            throw new ArgumentNullException(parameterName);
        }

        var expectedName = expectedAssembly.GetName().Name;
        var isReferenced = expectedName is not null && HasReference(RequireSubject(), expectedName);
        if (isReferenced != shouldReference)
        {
            var condition = shouldReference ? "to reference" : "not to reference";
            AssertionFailure.Fail($"Expected assembly {condition} the supplied assembly by simple name.");
        }

        return this;
    }

    private AssemblyAssertions CheckTypeName(string? fullName, bool shouldExist)
    {
        if (fullName is null)
        {
            throw new ArgumentNullException(nameof(fullName));
        }

        if (string.IsNullOrWhiteSpace(fullName))
        {
            throw new ArgumentException("A full type name must be supplied.", nameof(fullName));
        }

        var typeExists = RequireSubject().GetType(fullName, throwOnError: false, ignoreCase: false) is not null;
        if (typeExists != shouldExist)
        {
            var condition = shouldExist ? "to define" : "not to define";
            AssertionFailure.Fail($"Expected assembly {condition} the requested type.");
        }

        return this;
    }

    private AssemblyAssertions CheckType(Type? expectedType, bool shouldExist, string parameterName)
    {
        if (expectedType is null)
        {
            throw new ArgumentNullException(parameterName);
        }

        var typeExists = ReferenceEquals(expectedType.Assembly, RequireSubject());
        if (typeExists != shouldExist)
        {
            var condition = shouldExist ? "to define" : "not to define";
            AssertionFailure.Fail($"Expected assembly {condition} the supplied runtime type.");
        }

        return this;
    }

    private static bool HasReference(Assembly subject, string expectedName)
    {
        foreach (var reference in subject.GetReferencedAssemblies())
        {
            if (string.Equals(reference.Name, expectedName, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private Assembly RequireSubject()
        => Subject ?? throw new AstraFlowAssertionException("Expected a non-null assembly.");
}
