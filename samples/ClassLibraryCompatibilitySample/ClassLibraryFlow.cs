using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace ClassLibraryCompatibilitySample;

public static class ClassLibraryFlow
{
    public static IServiceCollection AddClassLibraryFlow(this IServiceCollection services)
    {
        return services.AddAstraFlowMediator(typeof(ClassLibraryFlow));
    }
}

public sealed record ClassLibraryQuery(string Value) : IRequest<string>;

public sealed class ClassLibraryQueryHandler : IRequestHandler<ClassLibraryQuery, string>
{
    public Task<string> Handle(ClassLibraryQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(request.Value.ToUpperInvariant());
    }
}
