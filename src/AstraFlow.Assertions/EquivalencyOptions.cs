using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace AstraFlow.Assertions;

/// <summary>Configures a single structural object comparison.</summary>
/// <remarks>Options are created per assertion call and are not shared between tests.</remarks>
public sealed class EquivalencyOptions
{
    private readonly HashSet<string> _excludedMembers = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> _excludedPaths = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> _includedPaths = new(StringComparer.OrdinalIgnoreCase);
    private readonly List<ComparerRegistration> _comparers = new();

    /// <summary>Gets the maximum object-graph depth, which defaults to 32.</summary>
    public int MaximumDepth { get; private set; } = 32;

    internal bool IsCollectionOrderIgnored { get; private set; }
    internal bool IncludesPublicFields { get; private set; }
    internal bool HasExplicitInclusions => _includedPaths.Count > 0;

    /// <summary>Includes public instance fields alongside readable public properties.</summary>
    /// <remarks>Public fields are ignored by default; static fields are never compared.</remarks>
    public EquivalencyOptions IncludingFields()
    {
        IncludesPublicFields = true;
        return this;
    }

    /// <summary>Compares only the expected members at the supplied dot-separated paths from the root.</summary>
    /// <param name="memberPaths">Paths such as <c>Billing.AddressLine</c>; collection indexes are omitted.</param>
    /// <remarks>Path names are case-insensitive. Selecting a path also compares its ancestors and descendants. Exclusions still take precedence.</remarks>
    public EquivalencyOptions IncludingPath(params string[] memberPaths)
    {
        if (memberPaths is null)
        {
            throw new ArgumentNullException(nameof(memberPaths));
        }

        if (memberPaths.Length == 0)
        {
            throw new ArgumentException("At least one member path must be supplied.", nameof(memberPaths));
        }

        foreach (var memberPath in memberPaths)
        {
            if (string.IsNullOrWhiteSpace(memberPath))
            {
                throw new ArgumentException("Selected member paths cannot be null or whitespace.", nameof(memberPaths));
            }

            _includedPaths.Add(NormalizeConfiguredPath(memberPath, nameof(memberPaths)));
        }

        return this;
    }

    /// <summary>Excludes properties with any of the supplied names at every depth.</summary>
    /// <param name="memberNames">Property names to skip while comparing the graph.</param>
    public EquivalencyOptions Excluding(params string[] memberNames)
    {
        if (memberNames is null)
        {
            throw new ArgumentNullException(nameof(memberNames));
        }

        foreach (var memberName in memberNames)
        {
            if (string.IsNullOrWhiteSpace(memberName))
            {
                throw new ArgumentException("Excluded property names cannot be null or whitespace.", nameof(memberNames));
            }

            _excludedMembers.Add(memberName);
        }

        return this;
    }

    /// <summary>Excludes properties at the supplied dot-separated paths from the root object.</summary>
    /// <param name="memberPaths">Paths such as <c>Billing.AddressLine</c>; collection indexes are omitted.</param>
    public EquivalencyOptions ExcludingPath(params string[] memberPaths)
    {
        if (memberPaths is null)
        {
            throw new ArgumentNullException(nameof(memberPaths));
        }

        foreach (var memberPath in memberPaths)
        {
            if (string.IsNullOrWhiteSpace(memberPath))
            {
                throw new ArgumentException("Excluded property paths cannot be null or whitespace.", nameof(memberPaths));
            }

            _excludedPaths.Add(NormalizeConfiguredPath(memberPath, nameof(memberPaths)));
        }

        return this;
    }

    /// <summary>Sets the maximum object-graph depth for this comparison.</summary>
    /// <param name="maximumDepth">A value from 1 through 128.</param>
    public EquivalencyOptions WithMaximumDepth(int maximumDepth)
    {
        if (maximumDepth is < 1 or > 128)
        {
            throw new ArgumentOutOfRangeException(nameof(maximumDepth), maximumDepth, "Maximum depth must be between 1 and 128.");
        }

        MaximumDepth = maximumDepth;
        return this;
    }

    /// <summary>Compares collection items without requiring them to appear in the same order.</summary>
    public EquivalencyOptions IgnoringCollectionOrder()
    {
        IsCollectionOrderIgnored = true;
        return this;
    }

    /// <summary>Uses the supplied equality comparer whenever both values can be compared as <typeparamref name="T"/>.</summary>
    /// <typeparam name="T">The value type handled by the comparer.</typeparam>
    /// <param name="comparer">The equality comparer to use.</param>
    /// <remarks>When multiple registered comparers match, the most recently registered comparer is used.</remarks>
    public EquivalencyOptions Using<T>(IEqualityComparer<T> comparer)
    {
        if (comparer is null)
        {
            throw new ArgumentNullException(nameof(comparer));
        }

        _comparers.RemoveAll(registration => registration.ValueType == typeof(T) && registration.MemberPath is null);
        _comparers.Add(new ComparerRegistration(typeof(T), null, (subject, expected) =>
        {
            if (!TryCast(subject, out T subjectValue) || !TryCast(expected, out T expectedValue))
            {
                return ComparerResult.NotApplicable;
            }

            return new ComparerResult(true, comparer.Equals(subjectValue, expectedValue));
        }));

        return this;
    }

    /// <summary>Uses the supplied comparer only for values at the specified property path.</summary>
    /// <typeparam name="T">The value type handled by the comparer.</typeparam>
    /// <param name="memberPath">A dot-separated property path from the root; omit collection indexes.</param>
    /// <param name="comparer">The equality comparer to use at that path.</param>
    /// <remarks>A path-specific comparer takes precedence over a comparer registered for the value type.</remarks>
    public EquivalencyOptions Using<T>(string memberPath, IEqualityComparer<T> comparer)
    {
        if (string.IsNullOrWhiteSpace(memberPath))
        {
            throw new ArgumentException("Comparer property paths cannot be null or whitespace.", nameof(memberPath));
        }

        if (comparer is null)
        {
            throw new ArgumentNullException(nameof(comparer));
        }

        var normalizedPath = NormalizeConfiguredPath(memberPath, nameof(memberPath));
        _comparers.RemoveAll(registration =>
            registration.ValueType == typeof(T)
            && string.Equals(registration.MemberPath, normalizedPath, StringComparison.OrdinalIgnoreCase));
        _comparers.Add(new ComparerRegistration(typeof(T), normalizedPath, (subject, expected) =>
        {
            if (!TryCast(subject, out T subjectValue) || !TryCast(expected, out T expectedValue))
            {
                return ComparerResult.NotApplicable;
            }

            return new ComparerResult(true, comparer.Equals(subjectValue, expectedValue));
        }));

        return this;
    }

    internal bool IsExcluded(string parentPath, string memberName) =>
        _excludedMembers.Contains(memberName)
        || _excludedPaths.Contains(NormalizePath(parentPath, memberName));

    internal bool IsIncluded(string parentPath, string memberName)
    {
        if (!HasExplicitInclusions)
        {
            return true;
        }

        var currentPath = NormalizePath(parentPath, memberName);
        foreach (var includedPath in _includedPaths)
        {
            if (string.Equals(currentPath, includedPath, StringComparison.OrdinalIgnoreCase)
                || currentPath.StartsWith(includedPath + ".", StringComparison.OrdinalIgnoreCase)
                || includedPath.StartsWith(currentPath + ".", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    internal bool HasIncludedDescendants(string path)
    {
        if (!HasExplicitInclusions)
        {
            return false;
        }

        var normalizedPath = NormalizeRuntimePath(path);
        var prefix = normalizedPath.Length == 0 ? string.Empty : normalizedPath + ".";
        foreach (var includedPath in _includedPaths)
        {
            if (includedPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
                && includedPath.Length > prefix.Length)
            {
                return true;
            }
        }

        return false;
    }

    internal IEnumerable<string> GetRequiredIncludedMembers(string parentPath)
    {
        var normalizedParentPath = NormalizeRuntimePath(parentPath);
        var prefix = normalizedParentPath.Length == 0 ? string.Empty : normalizedParentPath + ".";
        var requiredMembers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var includedPath in _includedPaths)
        {
            if (!includedPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var remainingPath = includedPath.Substring(prefix.Length);
            if (remainingPath.Length == 0)
            {
                continue;
            }

            var separatorIndex = remainingPath.IndexOf('.');
            requiredMembers.Add(separatorIndex < 0 ? remainingPath : remainingPath.Substring(0, separatorIndex));
        }

        return requiredMembers;
    }

    internal ArgumentException CreateMissingIncludedPathException(string parentPath, string memberName)
    {
        var normalizedParentPath = NormalizeRuntimePath(parentPath);
        var missingPath = normalizedParentPath.Length == 0
            ? memberName
            : normalizedParentPath + "." + memberName;
        return new ArgumentException(
            $"Selected member path '{missingPath}' cannot be resolved in the expected object graph.",
            "configure");
    }

    internal void ValidateIncludedPaths(object? expected)
    {
        if (!HasExplicitInclusions)
        {
            return;
        }

        if (expected is null)
        {
            throw CreateMissingIncludedPathException("$", GetRequiredIncludedMembers("$").FirstOrDefault() ?? "<selected-member>");
        }

        foreach (var includedPath in _includedPaths)
        {
            var currentType = expected.GetType();
            var segments = includedPath.Split('.');
            foreach (var segment in segments)
            {
                if (IsAtomicType(currentType))
                {
                    throw CreateMissingIncludedPathException("$", includedPath);
                }

                var dictionaryValueType = GetDictionaryValueType(currentType);
                if (dictionaryValueType is null && typeof(IDictionary).IsAssignableFrom(currentType))
                {
                    throw CreateMissingIncludedPathException("$", includedPath);
                }

                currentType = dictionaryValueType ?? GetSequenceElementType(currentType) ?? currentType;
                var memberTypes = GetPublicMemberTypes(currentType, segment).ToArray();
                if (memberTypes.Length != 1)
                {
                    throw CreateMissingIncludedPathException("$", includedPath);
                }

                currentType = memberTypes[0];
            }
        }
    }

    private Type[] GetPublicMemberTypes(Type type, string name)
    {
        var members = type
            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Where(property => property.GetIndexParameters().Length == 0
                && property.GetGetMethod(nonPublic: false) is not null
                && string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
            .Select(property => property.PropertyType);

        if (IncludesPublicFields)
        {
            members = members.Concat(type
                .GetFields(BindingFlags.Instance | BindingFlags.Public)
                .Where(field => string.Equals(field.Name, name, StringComparison.OrdinalIgnoreCase))
                .Select(field => field.FieldType));
        }

        return members.ToArray();
    }

    private static Type? GetSequenceElementType(Type type)
    {
        if (type.IsArray)
        {
            return type.GetElementType();
        }

        var enumerableType = type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IEnumerable<>)
            ? type
            : type.GetInterfaces().FirstOrDefault(interfaceType => interfaceType.IsGenericType
                && interfaceType.GetGenericTypeDefinition() == typeof(IEnumerable<>));
        return enumerableType?.GetGenericArguments()[0];
    }

    private static Type? GetDictionaryValueType(Type type)
    {
        var dictionaryType = IsDictionaryInterface(type)
            ? type
            : type.GetInterfaces().FirstOrDefault(IsDictionaryInterface);
        return dictionaryType?.GetGenericArguments()[1];
    }

    private static bool IsDictionaryInterface(Type type) =>
        type.IsGenericType
        && (type.GetGenericTypeDefinition() == typeof(IDictionary<,>)
            || type.GetGenericTypeDefinition() == typeof(IReadOnlyDictionary<,>));

    private static bool IsAtomicType(Type type) =>
        type.IsValueType
        || type == typeof(string)
        || typeof(Type).IsAssignableFrom(type)
        || typeof(Uri).IsAssignableFrom(type)
        || typeof(Version).IsAssignableFrom(type)
        || typeof(Delegate).IsAssignableFrom(type)
        || typeof(MemberInfo).IsAssignableFrom(type);

    internal bool TryCompare(string path, object? subject, object? expected, out bool areEqual)
    {
        var normalizedPath = NormalizeRuntimePath(path);
        if (normalizedPath.Length > 0)
        {
            for (var index = _comparers.Count - 1; index >= 0; index--)
            {
                if (!string.Equals(_comparers[index].MemberPath, normalizedPath, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var pathResult = _comparers[index].Compare(subject, expected);
                if (pathResult.IsApplicable)
                {
                    areEqual = pathResult.AreEqual;
                    return true;
                }
            }
        }

        for (var index = _comparers.Count - 1; index >= 0; index--)
        {
            if (_comparers[index].MemberPath is null)
            {
            var result = _comparers[index].Compare(subject, expected);
            if (result.IsApplicable)
            {
                areEqual = result.AreEqual;
                return true;
            }
            }
        }

        areEqual = false;
        return false;
    }

    private static bool TryCast<T>(object? value, out T typed)
    {
        if (value is T result)
        {
            typed = result;
            return true;
        }

        if (value is null && default(T) is null)
        {
            typed = default!;
            return true;
        }

        typed = default!;
        return false;
    }

    private static string NormalizePath(string parentPath, string memberName)
    {
        return NormalizeRuntimePath(parentPath + "." + memberName);
    }

    private static string NormalizeConfiguredPath(string memberPath, string parameterName)
    {
        var segments = memberPath.Split('.');
        foreach (var segment in segments)
        {
            if (string.IsNullOrWhiteSpace(segment) || segment.Contains("[") || segment.Contains("]") || segment.Contains("$"))
            {
                throw new ArgumentException("Property paths must contain dot-separated property names without indexes or a root marker.", parameterName);
            }
        }

        return string.Join(".", segments);
    }

    private static string NormalizeRuntimePath(string path)
    {
        var result = new StringBuilder(path.Length);
        var appendSeparator = false;

        for (var index = 0; index < path.Length; index++)
        {
            var character = path[index];
            if (character == '$')
            {
                continue;
            }

            if (character == '.')
            {
                appendSeparator = result.Length > 0;
                continue;
            }

            if (character == '[')
            {
                while (index + 1 < path.Length && path[index + 1] != ']')
                {
                    index++;
                }

                if (index + 1 < path.Length)
                {
                    index++;
                }

                continue;
            }

            if (appendSeparator)
            {
                result.Append('.');
                appendSeparator = false;
            }

            result.Append(character);
        }

        return result.ToString();
    }

    private readonly struct ComparerRegistration
    {
        public ComparerRegistration(Type valueType, string? memberPath, Func<object?, object?, ComparerResult> compare)
        {
            ValueType = valueType;
            MemberPath = memberPath;
            Compare = compare;
        }

        public Type ValueType { get; }

        public string? MemberPath { get; }

        public Func<object?, object?, ComparerResult> Compare { get; }
    }

    private readonly struct ComparerResult
    {
        public static ComparerResult NotApplicable => new(false, false);

        public ComparerResult(bool isApplicable, bool areEqual)
        {
            IsApplicable = isApplicable;
            AreEqual = areEqual;
        }

        public bool IsApplicable { get; }

        public bool AreEqual { get; }
    }
}
