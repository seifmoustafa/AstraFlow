namespace AstraFlow.Mapper;

/// <summary>
/// Controls how projection validation findings affect startup validation.
/// </summary>
public enum ProjectionValidationMode
{
    /// <summary>
    /// Do not validate projection registrations or expressions.
    /// </summary>
    Disabled = 0,

    /// <summary>
    /// Report projection findings as warnings without failing startup.
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Report projection findings as errors and fail startup validation.
    /// </summary>
    Error = 2
}
