using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace AstraFlow.Assertions;

internal sealed class ObjectGraphEquivalencyComparer
{
    private readonly EquivalencyOptions _options;
    private readonly ComparisonContext _context;
    private readonly HashSet<ReferencePair> _visited;

    public ObjectGraphEquivalencyComparer(EquivalencyOptions options)
    {
        _options = options;
        _context = new ComparisonContext();
        _visited = new HashSet<ReferencePair>();
    }

    private ObjectGraphEquivalencyComparer(EquivalencyOptions options, HashSet<ReferencePair> visited, ComparisonContext context)
    {
        _options = options;
        _context = context;
        _visited = new HashSet<ReferencePair>(visited);
    }

    public bool TryCompare(object? subject, object? expected, out string mismatchPath) =>
        Compare(subject, expected, "$", 0, out mismatchPath);

    public ObjectGraphEquivalencyComparer CreateFreshComparison() =>
        new(_options, new HashSet<ReferencePair>(), _context);

    private bool Compare(object? subject, object? expected, string path, int depth, out string mismatchPath)
    {
        var hasIncludedDescendants = _options.HasIncludedDescendants(path);
        if (ReferenceEquals(subject, expected) && !hasIncludedDescendants)
        {
            mismatchPath = string.Empty;
            return true;
        }

        if (_options.TryCompare(path, subject, expected, out var customComparison))
        {
            mismatchPath = customComparison ? string.Empty : path;
            return customComparison;
        }

        if (expected is null && hasIncludedDescendants)
        {
            var missingMember = _options.GetRequiredIncludedMembers(path).FirstOrDefault() ?? "<selected-member>";
            throw _options.CreateMissingIncludedPathException(path, missingMember);
        }

        if (subject is null || expected is null)
        {
            mismatchPath = path;
            return false;
        }

        var subjectType = subject.GetType();
        var expectedType = expected.GetType();
        if (IsAtomic(expectedType) && hasIncludedDescendants)
        {
            var missingMember = _options.GetRequiredIncludedMembers(path).FirstOrDefault() ?? "<selected-member>";
            throw _options.CreateMissingIncludedPathException(path, missingMember);
        }

        if (IsAtomic(subjectType) || IsAtomic(expectedType))
        {
            var equal = subjectType == expectedType && Equals(subject, expected);
            mismatchPath = equal ? string.Empty : path;
            return equal;
        }

        if (!subjectType.IsValueType && !expectedType.IsValueType)
        {
            if (!_visited.Add(new ReferencePair(subject, expected)))
            {
                mismatchPath = string.Empty;
                return true;
            }
        }

        if (depth > _options.MaximumDepth)
        {
            mismatchPath = path;
            return false;
        }

        var subjectIsDictionary = IsDictionary(subject);
        var expectedIsDictionary = IsDictionary(expected);
        if (subjectIsDictionary || expectedIsDictionary)
        {
            if (!subjectIsDictionary || !expectedIsDictionary)
            {
                mismatchPath = path;
                return false;
            }

            return CompareDictionaries(subject, expected, path, depth, out mismatchPath);
        }

        var subjectIsSequence = subject is IEnumerable;
        var expectedIsSequence = expected is IEnumerable;
        if (subjectIsSequence || expectedIsSequence)
        {
            if (!subjectIsSequence || !expectedIsSequence)
            {
                mismatchPath = path;
                return false;
            }

            return CompareSequences((IEnumerable)subject, (IEnumerable)expected, path, depth, out mismatchPath);
        }

        return CompareProperties(subject, expected, subjectType, expectedType, path, depth, out mismatchPath);
    }

    private bool CompareDictionaries(object subject, object expected, string path, int depth, out string mismatchPath)
    {
        var expectedEntries = ReadDictionaryEntries(expected);
        var subjectCount = ReadDictionaryCount(subject);
        if (subjectCount != expectedEntries.Count)
        {
            mismatchPath = path + ".Count";
            return false;
        }

        foreach (var expectedEntry in expectedEntries)
        {
            if (!TryGetDictionaryValue(subject, expectedEntry.Key, out var actualValue))
            {
                mismatchPath = path + "[key]";
                return false;
            }

            if (!Compare(actualValue, expectedEntry.Value, path + "[entry]", depth + 1, out mismatchPath))
            {
                return false;
            }
        }

        mismatchPath = string.Empty;
        return true;
    }

    private bool CompareSequences(IEnumerable subject, IEnumerable expected, string path, int depth, out string mismatchPath)
    {
        var subjectItems = Materialize(subject);
        var expectedItems = Materialize(expected);
        if (subjectItems.Count != expectedItems.Count)
        {
            mismatchPath = path + ".Count";
            return false;
        }

        if (_options.IsCollectionOrderIgnored)
        {
            return CompareSequencesIgnoringOrder(subjectItems, expectedItems, path, depth, out mismatchPath);
        }

        for (var index = 0; index < subjectItems.Count; index++)
        {
            if (!Compare(subjectItems[index], expectedItems[index], path + "[" + index + "]", depth + 1, out mismatchPath))
            {
                return false;
            }
        }

        mismatchPath = string.Empty;
        return true;
    }

    private bool CompareSequencesIgnoringOrder(
        List<object?> subjectItems,
        List<object?> expectedItems,
        string path,
        int depth,
        out string mismatchPath)
    {
        var subjectMatches = new int[subjectItems.Count];
        for (var index = 0; index < subjectMatches.Length; index++)
        {
            subjectMatches[index] = -1;
        }

        for (var expectedIndex = 0; expectedIndex < expectedItems.Count; expectedIndex++)
        {
            var visitedSubjects = new bool[subjectItems.Count];
            if (!TryMatchExpectedItem(expectedIndex, subjectItems, expectedItems, subjectMatches, visitedSubjects, path, depth))
            {
                mismatchPath = path + "[" + expectedIndex + "]";
                return false;
            }
        }

        mismatchPath = string.Empty;
        return true;
    }

    private bool TryMatchExpectedItem(
        int expectedIndex,
        List<object?> subjectItems,
        List<object?> expectedItems,
        int[] subjectMatches,
        bool[] visitedSubjects,
        string path,
        int depth)
    {
        for (var subjectIndex = 0; subjectIndex < subjectItems.Count; subjectIndex++)
        {
            if (visitedSubjects[subjectIndex])
            {
                continue;
            }

            var candidateComparer = new ObjectGraphEquivalencyComparer(_options, _visited, _context);
            if (!candidateComparer.Compare(
                    subjectItems[subjectIndex],
                    expectedItems[expectedIndex],
                    path + "[" + expectedIndex + "]",
                    depth + 1,
                    out _))
            {
                continue;
            }

            visitedSubjects[subjectIndex] = true;
            if (subjectMatches[subjectIndex] < 0
                || TryMatchExpectedItem(subjectMatches[subjectIndex], subjectItems, expectedItems, subjectMatches, visitedSubjects, path, depth))
            {
                subjectMatches[subjectIndex] = expectedIndex;
                return true;
            }
        }

        return false;
    }

    private bool CompareProperties(
        object subject,
        object expected,
        Type subjectType,
        Type expectedType,
        string path,
        int depth,
        out string mismatchPath)
    {
        var subjectMembers = GetMembers(subjectType, path, out mismatchPath);
        if (subjectMembers is null)
        {
            return false;
        }

        var expectedMembers = GetMembers(expectedType, path, out mismatchPath);
        if (expectedMembers is null)
        {
            return false;
        }

        foreach (var requiredMember in _options.GetRequiredIncludedMembers(path))
        {
            if (!expectedMembers.Keys.Any(memberName => string.Equals(memberName, requiredMember, StringComparison.OrdinalIgnoreCase))
                && !_options.IsExcluded(path, requiredMember))
            {
                throw _options.CreateMissingIncludedPathException(path, requiredMember);
            }
        }

        if (subjectMembers.Count == 0 && expectedMembers.Count == 0)
        {
            if (HasComparablePublicMembers(subjectType) || HasComparablePublicMembers(expectedType))
            {
                mismatchPath = string.Empty;
                return true;
            }

            var equal = subjectType == expectedType && Equals(subject, expected);
            mismatchPath = equal ? string.Empty : path;
            return equal;
        }

        foreach (var expectedMember in expectedMembers)
        {
            if (!subjectMembers.TryGetValue(expectedMember.Key, out var subjectMember))
            {
                mismatchPath = AppendMember(path, expectedMember.Key);
                return false;
            }

            var subjectValue = subjectMember(subject);
            var expectedValue = expectedMember.Value(expected);
            if (!Compare(subjectValue, expectedValue, AppendMember(path, expectedMember.Key), depth + 1, out mismatchPath))
            {
                return false;
            }
        }

        mismatchPath = string.Empty;
        return true;
    }

    private Dictionary<string, Func<object, object?>>? GetMembers(Type type, string path, out string mismatchPath)
    {
        var result = new Dictionary<string, Func<object, object?>>(StringComparer.Ordinal);
        var properties = type
            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Where(property => property.GetIndexParameters().Length == 0 && property.GetGetMethod(nonPublic: false) is not null)
            .Where(property => !_options.IsExcluded(path, property.Name))
            .Where(property => _options.IsIncluded(path, property.Name))
            .OrderBy(property => property.Name, StringComparer.Ordinal)
            .ThenBy(property => property.DeclaringType?.FullName, StringComparer.Ordinal);

        foreach (var property in properties)
        {
            if (result.ContainsKey(property.Name))
            {
                mismatchPath = AppendMember(path, property.Name);
                return null;
            }

            result.Add(property.Name, instance => property.GetValue(instance));
        }

        if (_options.IncludesPublicFields)
        {
            var fields = type
                .GetFields(BindingFlags.Instance | BindingFlags.Public)
                .Where(field => !_options.IsExcluded(path, field.Name))
                .Where(field => _options.IsIncluded(path, field.Name))
                .OrderBy(field => field.Name, StringComparer.Ordinal)
                .ThenBy(field => field.DeclaringType?.FullName, StringComparer.Ordinal);

            foreach (var field in fields)
            {
                if (result.ContainsKey(field.Name))
                {
                    mismatchPath = AppendMember(path, field.Name);
                    return null;
                }

                result.Add(field.Name, instance => field.GetValue(instance));
            }
        }

        mismatchPath = string.Empty;
        return result;
    }

    private static bool IsAtomic(Type type) =>
        type.IsValueType
        || type == typeof(string)
        || typeof(Type).IsAssignableFrom(type)
        || typeof(Uri).IsAssignableFrom(type)
        || typeof(Version).IsAssignableFrom(type)
        || typeof(Delegate).IsAssignableFrom(type)
        || typeof(MemberInfo).IsAssignableFrom(type);

    private bool HasComparablePublicMembers(Type type) =>
        type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Any(property => property.GetIndexParameters().Length == 0 && property.GetGetMethod(nonPublic: false) is not null)
        || (_options.IncludesPublicFields && type.GetFields(BindingFlags.Instance | BindingFlags.Public).Length > 0);

    private static bool IsDictionary(object value)
    {
        if (value is IDictionary)
        {
            return true;
        }

        return FindDictionaryInterface(value.GetType()) is not null;
    }

    private List<DictionaryEntryValue> ReadDictionaryEntries(object dictionary) => _context.ReadDictionaryEntries(dictionary);

    private static List<DictionaryEntryValue> ReadDictionaryEntriesCore(object dictionary)
    {
        var entries = new List<DictionaryEntryValue>();
        if (dictionary is IDictionary nonGenericDictionary)
        {
            foreach (DictionaryEntry entry in nonGenericDictionary)
            {
                entries.Add(new DictionaryEntryValue(entry.Key, entry.Value));
            }

            return entries;
        }

        if (dictionary is not IEnumerable enumerable)
        {
            return entries;
        }

        foreach (var pair in enumerable)
        {
            if (pair is null)
            {
                continue;
            }

            var pairType = pair.GetType();
            var keyProperty = pairType.GetProperty("Key", BindingFlags.Instance | BindingFlags.Public);
            var valueProperty = pairType.GetProperty("Value", BindingFlags.Instance | BindingFlags.Public);
            if (keyProperty is null || valueProperty is null)
            {
                continue;
            }

            entries.Add(new DictionaryEntryValue(keyProperty.GetValue(pair), valueProperty.GetValue(pair)));
        }

        return entries;
    }

    private static int ReadDictionaryCount(object dictionary)
    {
        if (dictionary is IDictionary nonGenericDictionary)
        {
            return nonGenericDictionary.Count;
        }

        var dictionaryInterface = FindDictionaryInterface(dictionary.GetType());
        var countProperty = dictionary.GetType().GetProperty("Count", BindingFlags.Instance | BindingFlags.Public)
            ?? dictionaryInterface?.GetProperty("Count");
        if (countProperty is null)
        {
            foreach (var interfaceType in dictionary.GetType().GetInterfaces())
            {
                countProperty = interfaceType.GetProperty("Count");
                if (countProperty is not null)
                {
                    break;
                }
            }
        }

        return countProperty?.GetValue(dictionary) is int count ? count : -1;
    }

    private static bool TryGetDictionaryValue(object dictionary, object? key, out object? value)
    {
        if (dictionary is IDictionary nonGenericDictionary)
        {
            if (key is not null && nonGenericDictionary.Contains(key))
            {
                value = nonGenericDictionary[key];
                return true;
            }

            value = null;
            return false;
        }

        var dictionaryInterface = FindDictionaryInterface(dictionary.GetType());
        var tryGetValue = dictionaryInterface?.GetMethod("TryGetValue");
        if (tryGetValue is null)
        {
            value = null;
            return false;
        }

        var arguments = new object?[] { key, null };
        var found = tryGetValue.Invoke(dictionary, arguments) is true;
        value = arguments[1];
        return found;
    }

    private static Type? FindDictionaryInterface(Type type)
    {
        foreach (var interfaceType in type.GetInterfaces())
        {
            if (!interfaceType.IsGenericType)
            {
                continue;
            }

            var definition = interfaceType.GetGenericTypeDefinition();
            if (definition == typeof(IDictionary<,>) || definition == typeof(IReadOnlyDictionary<,>))
            {
                return interfaceType;
            }
        }

        return null;
    }

    private List<object?> Materialize(IEnumerable sequence) => _context.Materialize(sequence);

    private static List<object?> MaterializeCore(IEnumerable sequence)
    {
        var items = new List<object?>();
        foreach (var item in sequence)
        {
            items.Add(item);
        }

        return items;
    }

    private static string AppendMember(string path, string memberName) => path + "." + memberName;

    private readonly struct DictionaryEntryValue
    {
        public DictionaryEntryValue(object? key, object? value)
        {
            Key = key;
            Value = value;
        }

        public object? Key { get; }

        public object? Value { get; }
    }

    private sealed class ComparisonContext
    {
        private readonly Dictionary<object, List<object?>> _sequenceSnapshots = new(new ObjectReferenceComparer());
        private readonly Dictionary<object, List<DictionaryEntryValue>> _dictionarySnapshots = new(new ObjectReferenceComparer());

        public List<object?> Materialize(IEnumerable sequence)
        {
            if (_sequenceSnapshots.TryGetValue(sequence, out var snapshot))
            {
                return snapshot;
            }

            snapshot = MaterializeCore(sequence);
            _sequenceSnapshots.Add(sequence, snapshot);
            return snapshot;
        }

        public List<DictionaryEntryValue> ReadDictionaryEntries(object dictionary)
        {
            if (_dictionarySnapshots.TryGetValue(dictionary, out var snapshot))
            {
                return snapshot;
            }

            snapshot = ReadDictionaryEntriesCore(dictionary);
            _dictionarySnapshots.Add(dictionary, snapshot);
            return snapshot;
        }
    }

    private sealed class ObjectReferenceComparer : IEqualityComparer<object>
    {
        public new bool Equals(object? left, object? right) => ReferenceEquals(left, right);

        public int GetHashCode(object value) => RuntimeHelpers.GetHashCode(value);
    }

    private readonly struct ReferencePair : IEquatable<ReferencePair>
    {
        private readonly object _subject;
        private readonly object _expected;

        public ReferencePair(object subject, object expected)
        {
            _subject = subject;
            _expected = expected;
        }

        public bool Equals(ReferencePair other) =>
            ReferenceEquals(_subject, other._subject) && ReferenceEquals(_expected, other._expected);

        public override bool Equals(object? obj) => obj is ReferencePair other && Equals(other);

        public override int GetHashCode() =>
            unchecked((RuntimeHelpers.GetHashCode(_subject) * 397) ^ RuntimeHelpers.GetHashCode(_expected));
    }
}
