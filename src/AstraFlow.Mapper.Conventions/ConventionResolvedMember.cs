using System.Reflection;

namespace AstraFlow.Mapper.Conventions;

internal sealed record ConventionResolvedMember(
    PropertyInfo DestinationProperty,
    PropertyInfo? SourceProperty,
    ConventionMemberMappingDefinition? Configuration,
    string Decision,
    string Reason,
    Func<object, object?>? SourceValueFactory,
    bool RequiresEnumToString,
    bool RequiresEnumToEnum,
    bool CanMap)
{
    public static ConventionResolvedMember Blocked(
        PropertyInfo destinationProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason)
    {
        return new(destinationProperty, null, configuration, decision, reason, null, false, false, false);
    }

    public static ConventionResolvedMember Mappable(
        PropertyInfo destinationProperty,
        PropertyInfo? sourceProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason,
        Func<object, object?>? sourceValueFactory,
        bool requiresEnumToString,
        bool requiresEnumToEnum)
    {
        return new(destinationProperty, sourceProperty, configuration, decision, reason, sourceValueFactory, requiresEnumToString, requiresEnumToEnum, true);
    }
}
