using AstraFlow.Mapper;
using AstraFlow.Mapper.Conventions;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddAstraFlowMapper(typeof(CustomerProfile));
services.AddAstraFlowConventionMapping(catalog =>
{
    catalog.AddProfile<CustomerProfile>();
});

using var provider = services.BuildServiceProvider();
var mapper = provider.GetRequiredService<IMapper>();
var plans = provider.GetRequiredService<IMappingPlanProvider>();

var response = mapper.Map<CustomerResponse>(
    new Customer(Guid.NewGuid(), "Ada Lovelace", "ada@example.com", null));

Console.WriteLine($"{response.DisplayName} <{response.Email}> score={response.Score}");

foreach (var plan in plans.GetMappingPlans())
{
    Console.WriteLine($"{plan.SourceType} -> {plan.DestinationType}");
    foreach (var member in plan.Members)
    {
        Console.WriteLine($"  {member.Decision}: {member.DestinationMember} <= {member.SourceMember}");
    }
}

internal sealed record Customer(Guid Id, string Name, string Email, int? Score);

internal sealed class CustomerResponse
{
    public string? DisplayName { get; set; }

    public string? Email { get; set; }

    public Guid Id { get; set; }

    public int Score { get; set; }
}

internal sealed class CustomerProfile : ConventionMappingProfile
{
    public CustomerProfile()
    {
        CreateMap<Customer, CustomerResponse>()
            .ForMember(destination => destination.DisplayName, member => member
                .MapFrom(source => source.Name)
                .Required())
            .ForMember(destination => destination.Score, member => member.NullSubstitute(0));
    }
}
