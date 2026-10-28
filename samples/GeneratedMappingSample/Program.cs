using AstraFlow.Mapper;

var dto = CustomerMaps.ToDto(new Customer { Name = "Ada", Orders = 3 });
Console.WriteLine($"{dto.Name}: {dto.Orders}");

internal sealed class Customer
{
    public string Name { get; set; } = "";
    public int Orders { get; set; }
}

internal sealed class CustomerDto
{
    public CustomerDto() { }
    public string Name { get; set; } = "";
    public int Orders { get; set; }
}

internal static partial class CustomerMaps
{
    [AstraGenerateMapping]
    internal static partial CustomerDto ToDto(Customer source);
}
