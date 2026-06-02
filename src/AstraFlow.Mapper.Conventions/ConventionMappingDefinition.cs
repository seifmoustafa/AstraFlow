using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMappingDefinition
{
    private readonly HashSet<string> _includedMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _ignoredMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _allowedSensitiveMembers = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> _includedSourceMembers = new(StringComparer.Ordinal);
    private readonly Dictionary<string, ConventionMemberMappingDefinition> _memberMappings = new(StringComparer.Ordinal);
    private readonly List<Action<object, object>> _beforeMapHooks = [];
    private readonly List<Action<object, object>> _afterMapHooks = [];
    private readonly List<ConventionDerivedMappingDefinition> _derivedMappings = [];

    public ConventionMappingDefinition(
        Type sourceType,
        Type destinationType,
        IReadOnlyList<ConventionValueTransformerDefinition> valueTransformers)
    {
        SourceType = sourceType ?? throw new ArgumentNullException(nameof(sourceType));
        DestinationType = destinationType ?? throw new ArgumentNullException(nameof(destinationType));
        ValueTransformers = valueTransformers ?? throw new ArgumentNullException(nameof(valueTransformers));
    }

    public Type SourceType { get; }

    public Type DestinationType { get; }

    public bool AllowCaseInsensitiveMemberMatching { get; set; }

    public bool UpdateMappingEnabled { get; set; }

    public bool FlatteningEnabled { get; set; }

    public bool UnflatteningEnabled { get; set; }

    public bool ExplicitReverseMapping { get; set; }

    public Type? IncludedBaseSourceType { get; private set; }

    public Type? IncludedBaseDestinationType { get; private set; }

    public bool IsPolymorphicDerivedMapping { get; set; }

    public IReadOnlyCollection<string> IncludedMembers => _includedMembers;

    public IReadOnlyCollection<string> IgnoredMembers => _ignoredMembers;

    public IReadOnlyCollection<string> AllowedSensitiveMembers => _allowedSensitiveMembers;

    public IReadOnlyCollection<string> IncludedSourceMembers => _includedSourceMembers;

    public IReadOnlyDictionary<string, ConventionMemberMappingDefinition> MemberMappings => _memberMappings;

    public IReadOnlyList<ConventionValueTransformerDefinition> ValueTransformers { get; }

    public IReadOnlyList<Action<object, object>> BeforeMapHooks => _beforeMapHooks;

    public IReadOnlyList<Action<object, object>> AfterMapHooks => _afterMapHooks;

    public IReadOnlyList<ConventionDerivedMappingDefinition> DerivedMappings => _derivedMappings;

    public ObjectMappingPair Pair => new(SourceType, DestinationType);

    public void Include(string destinationMemberName)
    {
        AddMember(_includedMembers, destinationMemberName, nameof(destinationMemberName));
    }

    public void Ignore(string destinationMemberName)
    {
        AddMember(_ignoredMembers, destinationMemberName, nameof(destinationMemberName));
    }

    public void AllowSensitiveMember(string memberName)
    {
        AddMember(_allowedSensitiveMembers, memberName, nameof(memberName));
    }

    public void IncludeSourceMember(string sourceMemberName)
    {
        AddMember(_includedSourceMembers, sourceMemberName, nameof(sourceMemberName));
    }

    public ConventionMemberMappingDefinition ConfigureMember(string destinationMemberName)
    {
        if (string.IsNullOrWhiteSpace(destinationMemberName))
            throw new ArgumentException("Member name cannot be empty.", nameof(destinationMemberName));

        var normalized = destinationMemberName.Trim();
        if (!_memberMappings.TryGetValue(normalized, out var memberMapping))
        {
            memberMapping = new ConventionMemberMappingDefinition(normalized);
            _memberMappings.Add(normalized, memberMapping);
        }

        return memberMapping;
    }

    public void AddBeforeMapHook<TSource, TDestination>(Action<TSource, TDestination> hook)
    {
        if (hook is null)
            throw new ArgumentNullException(nameof(hook));

        _beforeMapHooks.Add((source, destination) => hook((TSource)source, (TDestination)destination));
    }

    public void AddAfterMapHook<TSource, TDestination>(Action<TSource, TDestination> hook)
    {
        if (hook is null)
            throw new ArgumentNullException(nameof(hook));

        _afterMapHooks.Add((source, destination) => hook((TSource)source, (TDestination)destination));
    }

    public void IncludeBase(Type baseSourceType, Type baseDestinationType)
    {
        IncludedBaseSourceType = baseSourceType ?? throw new ArgumentNullException(nameof(baseSourceType));
        IncludedBaseDestinationType = baseDestinationType ?? throw new ArgumentNullException(nameof(baseDestinationType));
    }

    public void IncludeDerived(Type derivedSourceType, Type derivedDestinationType)
    {
        if (derivedSourceType is null)
            throw new ArgumentNullException(nameof(derivedSourceType));
        if (derivedDestinationType is null)
            throw new ArgumentNullException(nameof(derivedDestinationType));

        _derivedMappings.Add(new ConventionDerivedMappingDefinition(derivedSourceType, derivedDestinationType));
    }

    private static void AddMember(ICollection<string> members, string memberName, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(memberName))
            throw new ArgumentException("Member name cannot be empty.", parameterName);

        members.Add(memberName.Trim());
    }
}
