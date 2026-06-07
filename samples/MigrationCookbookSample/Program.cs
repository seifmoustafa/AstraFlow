using AstraFlow.Mapper;
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<ISecureIdCodec, MigrationSecureIdCodec>();
services.AddAstraFlowMediator(typeof(Program));
services.AddAstraFlowMapper(typeof(Program));

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();
var mapper = provider.GetRequiredService<IMapper>();

var order = await sender.Send(new GetOrder("order-42"));
var response = mapper.Map<OrderResponse>(order);

Console.WriteLine($"{response.Id}:{response.DisplayName}");

public sealed record GetOrder(string Id) : IRequest<Order>;

public sealed class GetOrderHandler : IRequestHandler<GetOrder, Order>
{
    public Task<Order> Handle(GetOrder request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new Order(Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), request.Id));
    }
}

public sealed record Order(Guid InternalId, string Name);

public sealed record OrderResponse(string Id, string DisplayName);

public sealed class OrderMappingRule(SecureIdMapper ids) : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Order, OrderResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(Order) && destinationType == typeof(OrderResponse);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var order = (Order)source!;
        return new OrderResponse(ids.Encrypt(order.InternalId), order.Name);
    }
}

public sealed class MigrationSecureIdCodec : ISecureIdCodec
{
    public string Encrypt(Guid id)
    {
        return $"migration_{id:N}";
    }

    public Guid? TryDecrypt(string? encryptedId)
    {
        if (encryptedId is null || !encryptedId.StartsWith("migration_", StringComparison.Ordinal))
        {
            return null;
        }

        return Guid.ParseExact(encryptedId["migration_".Length..], "N");
    }
}
