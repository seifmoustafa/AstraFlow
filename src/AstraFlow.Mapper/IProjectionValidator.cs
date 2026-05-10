namespace AstraFlow.Mapper;

/// <summary>
/// Validates registered projections for ambiguity and high-risk provider translation patterns.
/// </summary>
public interface IProjectionValidator
{
    /// <summary>
    /// Validates the current projection registry using the supplied mapper options.
    /// </summary>
    ProjectionValidationReport Validate(MappingOptions options);
}
