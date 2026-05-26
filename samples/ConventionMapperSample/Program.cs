using AstraFlow.Mapper;
using AstraFlow.Mapper.Conventions;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddAstraFlowMapper(typeof(CustomerProfile));
services.AddAstraFlowConventionMapping(
    catalog =>
    {
        catalog.AddProfile<CustomerProfile>();
    },
    options => options.StrictMode = false);

using var provider = services.BuildServiceProvider();
var mapper = provider.GetRequiredService<IMapper>();
var conventionMapper = provider.GetRequiredService<IConventionMapper>();
var plans = provider.GetRequiredService<IMappingPlanProvider>();

var response = mapper.Map<CustomerResponse>(
    new Customer(Guid.NewGuid(), "Ada Lovelace", "ada@example.com", null));

Console.WriteLine($"{response.DisplayName} <{response.Email}> score={response.Score}");

var existing = new CustomerAccount("old@example.com");
conventionMapper.MapInto(new CustomerPatch(true, "ada@example.com"), existing);
Console.WriteLine($"updated email={existing.Email}");

foreach (var plan in plans.GetMappingPlans())
{
    Console.WriteLine($"{plan.SourceType} -> {plan.DestinationType}");
    foreach (var member in plan.Members)
    {
        Console.WriteLine($"  {member.Decision}: {member.DestinationMember} <= {member.SourceMember}");
    }
}

internal sealed record Customer(Guid Id, string Name, string Email, int? Score);

internal sealed record CustomerResponse(Guid Id, string DisplayName, string Email, int Score);

internal sealed record CustomerPatch(bool HasEmail, string? Email);

internal sealed class CustomerAccount
{
    public CustomerAccount(string email)
    {
        Email = email;
    }

    public string? Email { get; set; }
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

        CreateMap<CustomerPatch, CustomerAccount>()
            .EnableUpdateMapping()
            .ForMember(destination => destination.Email, member => member
                .Condition(source => source.HasEmail));
    }
}
