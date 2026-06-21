using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

/// <summary>
/// Provides generated mapper and projection metadata discovered at compile time.
/// </summary>
public interface IGeneratedMapperMetadataProvider
{
    /// <summary>
    /// Gets generated mapper metadata for the assembly that produced the provider.
    /// </summary>
    /// <returns>Generated mapping rule and projection metadata.</returns>
    GeneratedMapperMetadata GetMetadata();
}

/// <summary>
/// Generated mapper and projection metadata for one compilation.
/// </summary>
/// <param name="MappingRules">Mapping rule implementation metadata.</param>
/// <param name="Projections">Projection implementation metadata.</param>
public sealed record GeneratedMapperMetadata(
    IReadOnlyList<GeneratedMappingRuleMetadata> MappingRules,
    IReadOnlyList<GeneratedProjectionMetadata> Projections);

/// <summary>
/// Generated metadata for one mapping rule implementation.
/// </summary>
/// <param name="ImplementationType">Concrete mapping rule implementation type.</param>
/// <param name="IsDeclared">Whether the rule implements <see cref="IDeclaredObjectMappingRule"/>.</param>
public sealed record GeneratedMappingRuleMetadata(
    Type ImplementationType,
    bool IsDeclared);

/// <summary>
/// Generated metadata for one projection implementation.
/// </summary>
/// <param name="SourceType">Projection source type.</param>
/// <param name="DestinationType">Projection destination type.</param>
/// <param name="ParameterType">Projection parameter type, when parameterized.</param>
/// <param name="ServiceType">Closed projection service type.</param>
/// <param name="ImplementationType">Concrete projection implementation type.</param>
/// <param name="Lifetime">Expected dependency injection lifetime for the projection.</param>
/// <param name="IsNamed">Whether the projection implements a named projection contract.</param>
public sealed record GeneratedProjectionMetadata(
    Type SourceType,
    Type DestinationType,
    Type? ParameterType,
    Type ServiceType,
    Type ImplementationType,
    ServiceLifetime Lifetime,
    bool IsNamed);
