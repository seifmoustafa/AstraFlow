using System.Reflection;

namespace AstraFlow.Mapper.Conventions;

internal sealed record ConventionResolvedMember(
    PropertyInfo DestinationProperty,
    IReadOnlyList<PropertyInfo> DestinationPath,
    PropertyInfo? SourceProperty,
    ConventionMemberMappingDefinition? Configuration,
    string Decision,
    string Reason,
    Func<object, object?>? SourceValueFactory,
    bool RequiresEnumToString,
    bool RequiresEnumToEnum,
    bool RequiresCollectionMapping,
    ConventionValueTransformerDefinition? ValueTransformer,
    bool IsConstructorBound,
    bool CanMap)
{
    public static ConventionResolvedMember Blocked(
        PropertyInfo destinationProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason)
    {
        return new(destinationProperty, [destinationProperty], null, configuration, decision, reason, null, false, false, false, null, false, false);
    }

    public static ConventionResolvedMember Mappable(
        PropertyInfo destinationProperty,
        IReadOnlyList<PropertyInfo> destinationPath,
        PropertyInfo? sourceProperty,
        ConventionMemberMappingDefinition? configuration,
        string decision,
        string reason,
        Func<object, object?>? sourceValueFactory,
        bool requiresEnumToString,
        bool requiresEnumToEnum,
        bool requiresCollectionMapping,
        ConventionValueTransformerDefinition? valueTransformer,
        bool isConstructorBound = false)
    {
        return new(destinationProperty, destinationPath, sourceProperty, configuration, decision, reason, sourceValueFactory, requiresEnumToString, requiresEnumToEnum, requiresCollectionMapping, valueTransformer, isConstructorBound, true);
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
        ConventionValueTransformerDefinition? valueTransformer = null,
        bool isConstructorBound = false)
    {
        return Mappable(
            destinationProperty,
            [destinationProperty],
            sourceProperty,
            configuration,
            decision,
            reason,
            sourceValueFactory,
            requiresEnumToString,
            requiresEnumToEnum,
            requiresCollectionMapping,
            valueTransformer,
            isConstructorBound);
    }
}
