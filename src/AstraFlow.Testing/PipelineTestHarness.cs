using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Executes pipeline behaviors around a supplied terminal delegate.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public sealed class PipelineTestHarness<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IReadOnlyList<IPipelineBehavior<TRequest, TResponse>> behaviors;
    private readonly Func<TRequest, CancellationToken, Task<TResponse>> terminal;

    /// <summary>
    /// Initializes a new pipeline harness.
    /// </summary>
    public PipelineTestHarness(
        IEnumerable<IPipelineBehavior<TRequest, TResponse>> behaviors,
        Func<TRequest, CancellationToken, Task<TResponse>> terminal)
    {
        if (behaviors is null)
        {
            throw new ArgumentNullException(nameof(behaviors));
        }

        this.behaviors = behaviors.ToArray();
        this.terminal = terminal ?? throw new ArgumentNullException(nameof(terminal));
    }

    /// <summary>
    /// Executes the behavior chain in the provided order.
    /// </summary>
    public Task<TResponse> Execute(
        TRequest request,
        CancellationToken cancellationToken = default)
    {
        RequestHandlerDelegate<TResponse> next = () => terminal(request, cancellationToken);

        for (var index = behaviors.Count - 1; index >= 0; index--)
        {
            var behavior = behaviors[index];
            var currentNext = next;
            next = () => behavior.Handle(request, currentNext, cancellationToken);
        }

        return next();
    }
}
