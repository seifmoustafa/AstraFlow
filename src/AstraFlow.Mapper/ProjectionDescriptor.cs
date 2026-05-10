using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

internal sealed record ProjectionDescriptor(
    Type SourceType,
    Type DestinationType,
    Type ServiceType,
    Type ImplementationType,
    ServiceLifetime Lifetime);
