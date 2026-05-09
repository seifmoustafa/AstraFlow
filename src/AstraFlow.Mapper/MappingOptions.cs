namespace AstraFlow.Mapper;

/// <summary>
/// Configuration options for the AstraFlow object mapper.
/// These settings are bindable from <c>appsettings.json</c> and environment variables.
/// </summary>
public sealed class MappingOptions
{
    /// <summary>
    /// Configuration section name used by the application host.
    /// </summary>
    public const string SectionName = "Mapping";

    /// <summary>
    /// Gets or sets whether registered mapping rules are validated when the application starts.
    /// Enabled by default so missing or duplicate mapping ownership fails before production traffic.
    /// </summary>
    public bool ValidateRuleCatalogOnStartup { get; set; } = true;

    /// <summary>
    /// Gets or sets whether each registered mapping rule must expose a declared mapping catalog.
    /// Enabled by default to keep module DTO mapping auditable and testable.
    /// </summary>
    public bool RequireDeclaredMappingRules { get; set; } = true;
}
