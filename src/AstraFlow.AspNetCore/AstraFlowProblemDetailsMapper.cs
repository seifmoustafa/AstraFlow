using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace AstraFlow.AspNetCore;

/// <summary>
/// Creates ASP.NET Core problem-details payloads from AstraFlow integration errors.
/// </summary>
public static class AstraFlowProblemDetailsMapper
{
    /// <summary>
    /// Creates a validation problem-details response from grouped validation errors.
    /// </summary>
    public static ValidationProblemDetails ToValidationProblemDetails(
        IReadOnlyDictionary<string, string[]> errors,
        string title = "One or more validation errors occurred.",
        int statusCode = StatusCodes.Status400BadRequest)
    {
        if (errors is null)
            throw new ArgumentNullException(nameof(errors));

        return new ValidationProblemDetails(errors.ToDictionary(
            pair => pair.Key,
            pair => pair.Value,
            StringComparer.Ordinal))
        {
            Title = title,
            Status = statusCode
        };
    }

    /// <summary>
    /// Creates a generic problem-details response.
    /// </summary>
    public static ProblemDetails ToProblemDetails(
        string title,
        string detail,
        int statusCode = StatusCodes.Status500InternalServerError)
    {
        return new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode
        };
    }
}
