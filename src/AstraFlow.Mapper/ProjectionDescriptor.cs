using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

internal sealed record ProjectionDescriptor(
    Type SourceType,
    Type DestinationType,
    Type? ParameterType,
    Type ServiceType,
    Type ImplementationType,
    ServiceLifetime Lifetime);
