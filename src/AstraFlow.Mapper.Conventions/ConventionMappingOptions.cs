using AstraFlow.Security;

namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Options for opt-in convention mapping.
/// </summary>
public sealed class ConventionMappingOptions
{
    /// <summary>
    /// Gets the configuration section name for convention mapping options.
    /// </summary>
    public const string SectionName = "Mapping:Conventions";

    /// <summary>
    /// Gets or sets whether exact source/destination member matching may fall back to case-insensitive matching.
    /// Disabled by default.
    /// </summary>
    public bool AllowCaseInsensitiveMemberMatching { get; set; }

    /// <summary>
    /// Gets or sets whether validation fails when convention plans contain warnings or errors.
    /// Enabled by default so unmapped members, ambiguity, and sensitive fields are visible before runtime.
    /// </summary>
    public bool StrictMode { get; set; } = true;

    /// <summary>
    /// Gets or sets whether sensitive members must be explicitly allowed before convention mapping can map them.
    /// Enabled by default.
    /// </summary>
    public bool RequireExplicitSensitiveMemberAllow { get; set; } = true;

    /// <summary>
    /// Gets sensitive member name fragments blocked by default.
    /// </summary>
    public ICollection<string> SensitiveMemberNameFragments { get; } =
        AstraFlowSensitiveDataPolicy.DefaultSensitiveNameFragments.ToArray();
}
