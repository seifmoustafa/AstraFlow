using System.Globalization;
using System.Diagnostics.CodeAnalysis;

namespace AstraFlow.Assertions;

internal static class AssertionFailure
{
    [DoesNotReturn]
    public static void Fail(string message) => throw new AstraFlowAssertionException(message);

    [DoesNotReturn]
    public static void FailWithBecause(string message, string? because, params object?[] becauseArgs)
        => Fail(AddBecause(message, because, becauseArgs));

    public static string? ValidateBecause(object? because) => because switch
    {
        null => null,
        string reason => reason,
        _ => throw new ArgumentException("Assertion failure context must be a string.", nameof(because)),
    };

    public static string AddBecause(string message, string? because, params object?[] becauseArgs)
    {
        var reason = because ?? string.Empty;
        if (string.IsNullOrWhiteSpace(reason))
        {
            return message;
        }

        var formattedBecause = (becauseArgs is not { Length: > 0 }
            ? reason
            : string.Format(CultureInfo.InvariantCulture, reason, becauseArgs)).Trim();
        if (formattedBecause.Length == 0)
        {
            return message;
        }

        var lastCharacter = formattedBecause[formattedBecause.Length - 1];
        var terminalPunctuation = lastCharacter is '.' or '!' or '?' ? string.Empty : ".";
        return $"{message} Because {formattedBecause}{terminalPunctuation}";
    }

    public static string Describe(object? value)
    {
        if (value is null)
        {
            return "<null>";
        }

        // Render only small scalar values. Arbitrary objects, strings, and identifiers can
        // contain secrets; never invoke user-controlled ToString() in a failure message.
        return value switch
        {
            bool boolean => boolean ? "true" : "false",
            byte number => number.ToString(CultureInfo.InvariantCulture),
            sbyte number => number.ToString(CultureInfo.InvariantCulture),
            short number => number.ToString(CultureInfo.InvariantCulture),
            ushort number => number.ToString(CultureInfo.InvariantCulture),
            int number => number.ToString(CultureInfo.InvariantCulture),
            uint number => number.ToString(CultureInfo.InvariantCulture),
            long number => number.ToString(CultureInfo.InvariantCulture),
            ulong number => number.ToString(CultureInfo.InvariantCulture),
            float number => number.ToString(CultureInfo.InvariantCulture),
            double number => number.ToString(CultureInfo.InvariantCulture),
            decimal number => number.ToString(CultureInfo.InvariantCulture),
            char => "<char>",
            string text => $"<string length={text.Length}>",
            _ => $"<{value.GetType().FullName ?? value.GetType().Name}>"
        };
    }
}
