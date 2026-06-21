using System.Linq.Expressions;
using AstraFlow.Mapper;
using AstraFlow.Mediator;

namespace AstraFlow.Benchmarks;

public sealed record BenchmarkRequest(string Message) : IRequest<string>;

public sealed record BenchmarkNotification(string Message) : INotification;

public sealed record BenchmarkCustomer(Guid Id, string Name, string Email, int Orders);

public sealed record BenchmarkCustomerDto(Guid Id, string Name, string Email, int Orders);

public sealed class BenchmarkRequestHandler : IRequestHandler<BenchmarkRequest, string>
{
    public Task<string> Handle(BenchmarkRequest request, CancellationToken cancellationToken)
    {
        return Task.FromResult("handled:" + request.Message);
    }
}

public sealed class PassThroughBehavior : IPipelineBehavior<BenchmarkRequest, string>
{
    public Task<string> Handle(
        BenchmarkRequest request,
        RequestHandlerDelegate<string> next,
        CancellationToken cancellationToken)
    {
        return next();
    }
}

public sealed class NoOpNotificationHandler : INotificationHandler<BenchmarkNotification>
{
    public Task Handle(BenchmarkNotification notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}

public sealed class BenchmarkCustomerMappingRule : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<BenchmarkCustomer, BenchmarkCustomerDto>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(BenchmarkCustomer) &&
            destinationType == typeof(BenchmarkCustomerDto);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        if (source is null)
            return null;

        var customer = (BenchmarkCustomer)source;
        return ManualMapping.Map(customer);
    }
}

public sealed class BenchmarkCustomerProjection : IProjection<BenchmarkCustomer, BenchmarkCustomerDto>
{
    public Expression<Func<BenchmarkCustomer, BenchmarkCustomerDto>> Expression =>
        customer => new BenchmarkCustomerDto(customer.Id, customer.Name, customer.Email, customer.Orders);
}

internal static class ManualMapping
{
    public static BenchmarkCustomerDto Map(BenchmarkCustomer customer)
    {
        return new BenchmarkCustomerDto(customer.Id, customer.Name, customer.Email, customer.Orders);
    }
}
