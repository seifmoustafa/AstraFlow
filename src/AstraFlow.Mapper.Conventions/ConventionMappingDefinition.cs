using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMappingDefinition
{
    private readonly HashSet<string> _includedMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _ignoredMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _allowedSensitiveMembers = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, ConventionMemberMappingDefinition> _memberMappings = new(StringComparer.Ordinal);

    public ConventionMappingDefinition(Type sourceType, Type destinationType)
    {
        SourceType = sourceType ?? throw new ArgumentNullException(nameof(sourceType));
        DestinationType = destinationType ?? throw new ArgumentNullException(nameof(destinationType));
    }

    public Type SourceType { get; }

    public Type DestinationType { get; }

    public bool AllowCaseInsensitiveMemberMatching { get; set; }

    public bool UpdateMappingEnabled { get; set; }

    public IReadOnlyCollection<string> IncludedMembers => _includedMembers;

    public IReadOnlyCollection<string> IgnoredMembers => _ignoredMembers;

    public IReadOnlyCollection<string> AllowedSensitiveMembers => _allowedSensitiveMembers;

    public IReadOnlyDictionary<string, ConventionMemberMappingDefinition> MemberMappings => _memberMappings;

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

    private static void AddMember(ICollection<string> members, string memberName, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(memberName))
            throw new ArgumentException("Member name cannot be empty.", parameterName);

        members.Add(memberName.Trim());
    }
}
