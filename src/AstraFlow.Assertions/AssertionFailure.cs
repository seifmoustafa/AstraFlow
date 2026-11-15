using System.Globalization;
using System.Diagnostics.CodeAnalysis;

namespace AstraFlow.Assertions;

internal static class AssertionFailure
{
    [DoesNotReturn]
    public static void Fail(string message) => throw new AstraFlowAssertionException(message);

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
