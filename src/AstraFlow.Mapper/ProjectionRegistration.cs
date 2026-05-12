using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

/// <summary>
/// Describes a projection registered in the AstraFlow projection registry.
/// </summary>
/// <param name="SourceType">Projection source type.</param>
/// <param name="DestinationType">Projection destination type.</param>
/// <param name="Name">Optional projection name.</param>
/// <param name="ServiceType">Registered projection service type.</param>
/// <param name="ImplementationType">Concrete projection implementation type.</param>
/// <param name="Lifetime">Dependency injection lifetime.</param>
public sealed record ProjectionRegistration(
    Type SourceType,
    Type DestinationType,
    string? Name,
    Type ServiceType,
    Type ImplementationType,
    ServiceLifetime Lifetime);
