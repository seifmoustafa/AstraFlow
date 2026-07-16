namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral assertions for grouped validation errors.
/// </summary>
public static class ValidationAssertions
{
    /// <summary>
    /// Throws when the grouped validation errors do not include the supplied property.
    /// </summary>
    public static IReadOnlyDictionary<string, string[]> ShouldContainValidationErrorFor(
        this IReadOnlyDictionary<string, string[]> errors,
        string propertyName)
    {
        if (errors is null)
            throw new ArgumentNullException(nameof(errors));

        if (!errors.TryGetValue(propertyName, out var messages) || messages.Length == 0)
            throw new InvalidOperationException($"Expected a validation error for '{propertyName}'.");

        return errors;
    }

    /// <summary>
    /// Throws when the grouped validation errors include the supplied property.
    /// </summary>
    public static IReadOnlyDictionary<string, string[]> ShouldNotContainValidationErrorFor(
        this IReadOnlyDictionary<string, string[]> errors,
        string propertyName)
    {
        if (errors is null)
            throw new ArgumentNullException(nameof(errors));

        if (errors.TryGetValue(propertyName, out var messages) && messages.Length != 0)
            throw new InvalidOperationException($"Expected no validation error for '{propertyName}'.");

        return errors;
    }
}
