using AstraFlow.Mapper;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<ISecureIdCodec, DemoSecureIdCodec>();
services.AddAstraFlowMapper(typeof(Program));

using var provider = services.BuildServiceProvider();
var mapper = provider.GetRequiredService<IMapper>();

var response = mapper.Map<CustomerResponse>(
    new Customer(Guid.NewGuid(), "Nora", "private-internal-note"));

Console.WriteLine($"{response.Id}: {response.Name}");

public sealed record Customer(Guid Id, string Name, string InternalNote);

public sealed record CustomerResponse(string Id, string Name);

public sealed class CustomerMappingRule(SecureIdMapper ids) : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Customer, CustomerResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(Customer) && destinationType == typeof(CustomerResponse);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var customer = (Customer)source!;
        return new CustomerResponse(ids.Encrypt(customer.Id), customer.Name);
    }
}

public sealed class DemoSecureIdCodec : ISecureIdCodec
{
    public string Encrypt(Guid id)
    {
        return $"demo_{id:N}";
    }

    public Guid? TryDecrypt(string? encryptedId)
    {
        if (encryptedId is null || !encryptedId.StartsWith("demo_", StringComparison.Ordinal))
        {
            return null;
        }

        return Guid.ParseExact(encryptedId["demo_".Length..], "N");
    }
}
