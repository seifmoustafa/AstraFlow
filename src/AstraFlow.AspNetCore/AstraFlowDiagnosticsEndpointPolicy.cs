using Microsoft.Extensions.Hosting;

namespace AstraFlow.AspNetCore;

/// <summary>
/// Determines whether the diagnostics endpoint is available for the current host.
/// </summary>
public static class AstraFlowDiagnosticsEndpointPolicy
{
    /// <summary>
    /// Returns true when diagnostics are explicitly enabled or the app is running in Development.
    /// </summary>
    public static bool IsEnabled(IHostEnvironment environment, AstraFlowAspNetCoreOptions options)
    {
        if (environment is null)
            throw new ArgumentNullException(nameof(environment));

        if (options is null)
            throw new ArgumentNullException(nameof(options));

        return options.EnableDiagnosticsOutsideDevelopment || environment.IsDevelopment();
    }
}
