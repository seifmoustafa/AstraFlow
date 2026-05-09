namespace AstraFlow.Mapper;

/// <summary>
/// Validates registered NEXORA object mapping rules before handlers depend on them.
/// </summary>
public interface IObjectMappingValidator
{
    /// <summary>
    /// Validates the mapper rule catalog for duplicate ownership, undeclared rules, and declaration drift.
    /// </summary>
    /// <param name="options">Mapper validation options.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when the registered rules are ambiguous, incomplete, or inconsistent.
    /// </exception>
    void Validate(MappingOptions options);
}
