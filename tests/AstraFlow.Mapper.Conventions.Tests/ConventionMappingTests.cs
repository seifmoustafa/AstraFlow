using AstraFlow.Diagnostics;
using AstraFlow.Mapper;
using AstraFlow.Mapper.Conventions;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Mapper.Conventions.Tests;

public sealed class ConventionMappingTests
{
    [Fact]
    public void Map_WithoutConventionRegistration_RemainsDisabledByDefault()
    {
        using var provider = CreateServices().BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<ReadCustomerDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*No mapping rule registered*CustomerEntity*ReadCustomerDto*");
    }

    [Fact]
    public void Map_WithExactConventionPair_MapsMatchingProperties()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, ReadCustomerDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var id = Guid.NewGuid();
        var result = mapper.Map<ReadCustomerDto>(new CustomerEntity(id, "Ada", "ada@example.com"));

        result.Id.Should().Be(id);
        result.Name.Should().Be("Ada");
        result.Email.Should().Be("ada@example.com");
    }

    [Fact]
    public void Map_WithCaseInsensitiveMatching_MapsWhenOptedIn()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<LowerCustomerEntity, ReadCustomerDto>()
                .UseCaseInsensitiveMemberMatching();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var id = Guid.NewGuid();
        var result = mapper.Map<ReadCustomerDto>(new LowerCustomerEntity(id, "Ada", "ada@example.com"));

        result.Id.Should().Be(id);
        result.Name.Should().Be("Ada");
        result.Email.Should().Be("ada@example.com");
    }

    [Fact]
    public void Map_WithIncludeAndIgnoreRules_MapsOnlyAllowedMembers()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<CustomerEntity, PartialCustomerDto>()
                    .Include(nameof(PartialCustomerDto.Name))
                    .Ignore(nameof(PartialCustomerDto.Email));
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<PartialCustomerDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));

        result.Name.Should().Be("Ada");
        result.Email.Should().BeNull();
    }

    [Fact]
    public void Plan_WithUnmappedMembers_ReportsSourceAndDestinationFindings()
    {
        using var provider = CreateServices(
            catalog => catalog.CreateMap<CustomerWithExtraEntity, CustomerWithExtraDto>(),
            options => options.StrictMode = false).BuildServiceProvider();

        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        plan.Findings.Select(finding => finding.Code).Should().Contain(["AFC001", "AFC002"]);
        plan.Members.Should().Contain(member => member.DestinationMember == nameof(CustomerWithExtraDto.DisplayName) && member.Decision == "Unmapped");
    }

    [Fact]
    public void Map_WithAmbiguousCaseInsensitiveSourceMembers_FailsClearly()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<AmbiguousCustomerEntity, AmbiguousCustomerDto>()
                .UseCaseInsensitiveMemberMatching();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<AmbiguousCustomerDto>(new AmbiguousCustomerEntity("upper", "lower"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC003*matched multiple source members*");
    }

    [Fact]
    public void Map_WithSensitiveMember_BlocksUnlessAllowed()
    {
        using var blockedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<SecretEntity, SecretDto>();
        }).BuildServiceProvider();

        var blocked = () => blockedProvider.GetRequiredService<IMapper>().Map<SecretDto>(new SecretEntity("token"));

        blocked.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC004*AllowSensitiveMember*");

        using var allowedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<SecretEntity, SecretDto>()
                .AllowSensitiveMember(nameof(SecretDto.ApiToken));
        }).BuildServiceProvider();

        var result = allowedProvider.GetRequiredService<IMapper>().Map<SecretDto>(new SecretEntity("token"));

        result.ApiToken.Should().Be("token");
    }

    [Fact]
    public void Map_WithStrictMode_FailsOnUnmappedConventionOutput()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, CustomerWithExtraDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<CustomerWithExtraDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC001*DisplayName*");
    }

    [Fact]
    public void PlanExport_IsDeterministicAndShowsEveryMappedMember()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.AddProfile<CustomerProfile>();
        }).BuildServiceProvider();

        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        plan.Members.Select(member => member.DestinationMember)
            .Should().Equal(nameof(ReadCustomerDto.Email), nameof(ReadCustomerDto.Id), nameof(ReadCustomerDto.Name));
        plan.Members.Should().OnlyContain(member => member.Decision == "Mapped");
    }

    [Fact]
    public void Diagnostics_ReportConventionMappingPlanMembers()
    {
        var services = CreateServices(catalog => catalog.CreateMap<CustomerEntity, ReadCustomerDto>());
        services.AddAstraFlowDiagnostics(options =>
        {
            options.ValidateRequestCoverage = false;
            options.ValidateMappingCatalog = false;
        });
        using var provider = services.BuildServiceProvider();

        var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();
        var report = reporter.CreateReport();
        var markdown = reporter.CreateMarkdownReport();

        report.Summary.MappingPlanCount.Should().Be(1);
        report.MappingPlans.Single().Members.Should().Contain(member => member.DestinationMember == nameof(ReadCustomerDto.Email));
        markdown.Should().Contain("## Mapping Plans");
        markdown.Should().Contain(nameof(ReadCustomerDto.Email));
    }

    private static ServiceCollection CreateServices(
        Action<ConventionMappingCatalog>? configureCatalog = null,
        Action<ConventionMappingOptions>? configureOptions = null)
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper(Array.Empty<Type>());
        if (configureCatalog is not null)
        {
            services.AddAstraFlowConventionMapping(configureCatalog, configureOptions);
        }

        return services;
    }

    private sealed record CustomerEntity(Guid Id, string Name, string Email);

    private sealed record CustomerWithExtraEntity(Guid Id, string Name, string Email, string LegacyCode);

    private sealed record LowerCustomerEntity(Guid id, string name, string email);

    private sealed record SecretEntity(string ApiToken);

    private sealed record AmbiguousCustomerEntity(string Name, string name);

    private sealed class ReadCustomerDto
    {
        public string? Email { get; set; }

        public Guid Id { get; set; }

        public string? Name { get; set; }
    }

    private sealed class PartialCustomerDto
    {
        public string? Email { get; set; }

        public string? Name { get; set; }
    }

    private sealed class CustomerWithExtraDto
    {
        public string? DisplayName { get; set; }

        public string? Email { get; set; }

        public Guid Id { get; set; }

        public string? Name { get; set; }
    }

    private sealed class SecretDto
    {
        public string? ApiToken { get; set; }
    }

    private sealed class AmbiguousCustomerDto
    {
        public string? NAME { get; set; }
    }

    private sealed class CustomerProfile : ConventionMappingProfile
    {
        public CustomerProfile()
        {
            CreateMap<CustomerEntity, ReadCustomerDto>();
        }
    }
}
