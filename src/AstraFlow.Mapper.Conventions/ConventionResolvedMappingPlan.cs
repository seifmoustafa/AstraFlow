using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal sealed record ConventionResolvedMappingPlan(
    MappingPlan Plan,
    IReadOnlyList<ConventionResolvedMember> Members,
    ConventionResolvedConstructor Constructor);
