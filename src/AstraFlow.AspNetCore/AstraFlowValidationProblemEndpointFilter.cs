using Microsoft.AspNetCore.Http;

namespace AstraFlow.AspNetCore;

/// <summary>
/// Converts known validation exceptions into ASP.NET Core validation problem responses.
/// </summary>
public sealed class AstraFlowValidationProblemEndpointFilter : IEndpointFilter
{
    /// <inheritdoc />
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        try
        {
            return await next(context);
        }
        catch (Exception ex) when (TryGetValidationErrors(ex, out var errors))
        {
            return Results.ValidationProblem(errors);
        }
    }

    private static bool TryGetValidationErrors(Exception exception, out Dictionary<string, string[]> errors)
    {
        var property = exception.GetType().GetProperty("Errors");
        if (property?.GetValue(exception) is not System.Collections.IEnumerable values)
        {
            errors = [];
            return false;
        }

        var grouped = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var value in values)
        {
            var propertyName = value?.GetType().GetProperty("PropertyName")?.GetValue(value) as string;
            var message = value?.GetType().GetProperty("Message")?.GetValue(value) as string;
            if (string.IsNullOrWhiteSpace(message))
                continue;

            propertyName = string.IsNullOrWhiteSpace(propertyName) ? "" : propertyName;
            if (!grouped.TryGetValue(propertyName, out var messages))
            {
                messages = [];
                grouped[propertyName] = messages;
            }

            messages.Add(message);
        }

        errors = grouped.ToDictionary(pair => pair.Key, pair => pair.Value.ToArray(), StringComparer.Ordinal);
        return errors.Count != 0;
    }
}
