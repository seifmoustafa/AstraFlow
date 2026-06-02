using System.Reflection;

namespace AstraFlow.Mapper.Conventions;

internal sealed record ConventionResolvedConstructorParameter(
    ParameterInfo Parameter,
    string DestinationMemberName,
    ConventionMemberMappingDefinition? Configuration,
    Func<object, object?> SourceValueFactory,
    bool RequiresEnumToString,
    bool RequiresEnumToEnum,
    bool RequiresCollectionMapping,
    ConventionValueTransformerDefinition? ValueTransformer);
