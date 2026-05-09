using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();
var publisher = provider.GetRequiredService<IPublisher>();

var receipt = await sender.Send(new CreateOrderCommand("ORD-1001"));
await publisher.Publish(new OrderCreatedNotification(receipt.OrderId));

Console.WriteLine($"Created {receipt.OrderId:N} for {receipt.Number}");

public sealed record CreateOrderCommand(string Number) : IRequest<CreateOrderReceipt>;

public sealed record CreateOrderReceipt(Guid OrderId, string Number);

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderReceipt>
{
    public Task<CreateOrderReceipt> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new CreateOrderReceipt(Guid.NewGuid(), request.Number));
    }
}

public sealed record OrderCreatedNotification(Guid OrderId) : INotification;

public sealed class OrderCreatedNotificationHandler : INotificationHandler<OrderCreatedNotification>
{
    public Task Handle(OrderCreatedNotification notification, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Notification handled for {notification.OrderId:N}");
        return Task.CompletedTask;
    }
}
