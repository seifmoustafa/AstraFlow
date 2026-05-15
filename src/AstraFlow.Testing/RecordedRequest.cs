namespace AstraFlow.Testing;

/// <summary>
/// Captures a request sent through a fake AstraFlow sender or mediator.
/// </summary>
/// <param name="Request">The request object.</param>
/// <param name="RequestType">The runtime request type.</param>
/// <param name="ResponseType">The expected response type.</param>
/// <param name="CancellationToken">The cancellation token used for dispatch.</param>
public sealed record RecordedRequest(
    object Request,
    Type RequestType,
    Type ResponseType,
    CancellationToken CancellationToken);
