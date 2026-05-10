using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Diagnostics;

/// <summary>
/// Describes one AstraFlow-related service registration discovered in an application service collection.
/// </summary>
/// <param name="Category">Registration category, such as request handler, mapping rule, or projection.</param>
/// <param name="ServiceType">Registered service type display name.</param>
/// <param name="ImplementationType">Implementation type display name when available.</param>
/// <param name="Lifetime">Dependency injection lifetime.</param>
public sealed record AstraFlowDiagnosticRegistration(
    string Category,
    string ServiceType,
    string? ImplementationType,
    ServiceLifetime Lifetime);
