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

    [Fact]
    public void Map_WithExplicitMemberSource_MapsRenamedRequiredMember()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, RenamedCustomerDto>()
                .ForMember(destination => destination.DisplayName, member => member
                    .MapFrom(source => source.Name)
                    .Required());
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<RenamedCustomerDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.DisplayName.Should().Be("Ada");
        plan.Members.Should().Contain(member =>
            member.DestinationMember == nameof(RenamedCustomerDto.DisplayName) &&
            member.SourceMember == nameof(CustomerEntity.Name) &&
            member.Reason.Contains("Required destination member."));
    }

    [Fact]
    public void Map_WithRequiredDestinationMissingSource_FailsClearly()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, RenamedCustomerDto>()
                .ForMember(destination => destination.DisplayName, member => member.Required());
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<RenamedCustomerDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC009*Required destination member*");
    }

    [Fact]
    public void Map_WithNullSubstitution_AppliesConfiguredFallbackAndReportsIt()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<NullableScoreEntity, ScoreDto>()
                .ForMember(destination => destination.Score, member => member.NullSubstitute(100));
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<ScoreDto>(new NullableScoreEntity(null));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Score.Should().Be(100);
        plan.Members.Single(member => member.DestinationMember == nameof(ScoreDto.Score))
            .Reason.Should().Contain("Null substitution configured.");
    }

    [Fact]
    public void Map_WithConverter_AppliesConverterAndReportsIt()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<OrderEntity, OrderDto>()
                .ForMember(destination => destination.Total, member => member
                    .ConvertUsing(source => source.TotalCents, cents => (cents / 100m).ToString("0.00")));
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<OrderDto>(new OrderEntity(1234));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Total.Should().Be("12.34");
        plan.Members.Single(member => member.DestinationMember == nameof(OrderDto.Total))
            .Decision.Should().Be("Converted");
    }

    [Fact]
    public void Map_WithCondition_SkipsMemberWhenPredicateIsFalseAndReportsIt()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<PatchCustomerDto, CustomerPatchResult>()
                    .ForMember(destination => destination.Email, member => member
                        .Condition(source => source.HasEmail));
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<CustomerPatchResult>(new PatchCustomerDto(false, "ada@example.com"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Email.Should().BeNull();
        plan.Members.Single(member => member.DestinationMember == nameof(CustomerPatchResult.Email))
            .Decision.Should().Be("MappedWhen");
    }

    [Fact]
    public void Map_WithEnumMembers_MapsMatchingEnumsAndEnumStrings()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<OrderStatusEntity, OrderStatusDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<OrderStatusDto>(new OrderStatusEntity(SourceOrderStatus.Paid, SourceOrderStatus.Pending));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Status.Should().Be(DestinationOrderStatus.Paid);
        result.StatusText.Should().Be("Pending");
        plan.Members.Should().Contain(member => member.Decision == "EnumToEnum");
        plan.Members.Should().Contain(member => member.Decision == "EnumToString");
    }

    [Fact]
    public void Map_WithEnumMismatch_FailsClearly()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<BrokenOrderStatusEntity, BrokenOrderStatusDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<BrokenOrderStatusDto>(new BrokenOrderStatusEntity(SourceOrderStatus.Paid));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC008*missing names*");
    }

    [Fact]
    public void Plan_WithUnsafeNullableAndNumericMembers_ReportsDiagnostics()
    {
        using var provider = CreateServices(
            catalog => catalog.CreateMap<UnsafeConversionEntity, UnsafeConversionDto>(),
            options => options.StrictMode = false).BuildServiceProvider();

        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        plan.Findings.Should().Contain(finding => finding.Code == "AFC006" && finding.Member == nameof(UnsafeConversionDto.Score));
        plan.Findings.Should().Contain(finding => finding.Code == "AFC007" && finding.Member == nameof(UnsafeConversionDto.Count));
        plan.Members.Should().Contain(member => member.DestinationMember == nameof(UnsafeConversionDto.Count) && member.Decision == "Blocked");
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

    private sealed record NullableScoreEntity(int? Score);

    private sealed record OrderEntity(int TotalCents);

    private sealed record PatchCustomerDto(bool HasEmail, string? Email);

    private sealed record OrderStatusEntity(SourceOrderStatus Status, SourceOrderStatus StatusText);

    private sealed record BrokenOrderStatusEntity(SourceOrderStatus Status);

    private sealed record UnsafeConversionEntity(int? Score, int Count);

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

    private sealed class RenamedCustomerDto
    {
        public string? DisplayName { get; set; }

        public string? Email { get; set; }

        public Guid Id { get; set; }
    }

    private sealed class ScoreDto
    {
        public int Score { get; set; }
    }

    private sealed class OrderDto
    {
        public string? Total { get; set; }
    }

    private sealed class CustomerPatchResult
    {
        public string? Email { get; set; }
    }

    private sealed class OrderStatusDto
    {
        public DestinationOrderStatus Status { get; set; }

        public string? StatusText { get; set; }
    }

    private sealed class BrokenOrderStatusDto
    {
        public BrokenDestinationOrderStatus Status { get; set; }
    }

    private sealed class UnsafeConversionDto
    {
        public long Count { get; set; }

        public int Score { get; set; }
    }

    private enum SourceOrderStatus
    {
        Pending,
        Paid
    }

    private enum DestinationOrderStatus
    {
        Pending,
        Paid
    }

    private enum BrokenDestinationOrderStatus
    {
        Pending
    }

    private sealed class CustomerProfile : ConventionMappingProfile
    {
        public CustomerProfile()
        {
            CreateMap<CustomerEntity, ReadCustomerDto>();
        }
    }
}
