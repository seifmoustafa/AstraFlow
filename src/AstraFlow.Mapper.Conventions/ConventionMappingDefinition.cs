using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMappingDefinition
{
    private readonly HashSet<string> _includedMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _ignoredMembers = new(StringComparer.Ordinal);
    private readonly HashSet<string> _allowedSensitiveMembers = new(StringComparer.OrdinalIgnoreCase);

    public ConventionMappingDefinition(Type sourceType, Type destinationType)
    {
        SourceType = sourceType ?? throw new ArgumentNullException(nameof(sourceType));
        DestinationType = destinationType ?? throw new ArgumentNullException(nameof(destinationType));
    }

    public Type SourceType { get; }

    public Type DestinationType { get; }

    public bool AllowCaseInsensitiveMemberMatching { get; set; }

    public IReadOnlyCollection<string> IncludedMembers => _includedMembers;

    public IReadOnlyCollection<string> IgnoredMembers => _ignoredMembers;

    public IReadOnlyCollection<string> AllowedSensitiveMembers => _allowedSensitiveMembers;

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

    private static void AddMember(ICollection<string> members, string memberName, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(memberName))
            throw new ArgumentException("Member name cannot be empty.", parameterName);

        members.Add(memberName.Trim());
    }
}
