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
    bool RequiresCollectionMapping,
    bool IsConstructorBound,
    bool CanMap)
{
    public static ConventionResolvedMember Blocked(
        PropertyInfo destinationProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason)
    {
        return new(destinationProperty, null, configuration, decision, reason, null, false, false, false, false, false);
    }

    public static ConventionResolvedMember Mappable(
        PropertyInfo destinationProperty,
        PropertyInfo? sourceProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason,
        Func<object, object?>? sourceValueFactory,
        bool requiresEnumToString,
        bool requiresEnumToEnum,
        bool requiresCollectionMapping,
        bool isConstructorBound = false)
    {
        return new(destinationProperty, sourceProperty, configuration, decision, reason, sourceValueFactory, requiresEnumToString, requiresEnumToEnum, requiresCollectionMapping, isConstructorBound, true);
    }
}
