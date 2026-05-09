using AstraFlow;
using AstraFlow.Mediator;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAstraFlow(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(Program));

var app = builder.Build();

app.MapPost("/orders", async (CreateOrderRequest request, ISender sender) =>
{
    var response = await sender.Send(new CreateOrderCommand(request.Number));
    return Results.Created($"/orders/{response.Id:N}", response);
});

app.Run();

public sealed record CreateOrderRequest(string Number);

public sealed record CreateOrderCommand(string Number) : IRequest<CreateOrderResponse>;

public sealed record CreateOrderResponse(Guid Id, string Number);

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResponse>
{
    public Task<CreateOrderResponse> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new CreateOrderResponse(Guid.NewGuid(), request.Number));
    }
}
