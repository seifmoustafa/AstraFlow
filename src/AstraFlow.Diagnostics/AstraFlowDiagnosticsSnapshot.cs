using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Diagnostics;

internal sealed class AstraFlowDiagnosticsSnapshot
{
    public AstraFlowDiagnosticsSnapshot(IEnumerable<ServiceDescriptor> descriptors)
    {
        Descriptors = descriptors.ToArray();
    }

    public IReadOnlyList<ServiceDescriptor> Descriptors { get; }
}
