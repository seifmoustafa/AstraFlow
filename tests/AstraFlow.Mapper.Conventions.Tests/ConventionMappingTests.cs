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

    [Fact]
    public void Map_WithRecordDestination_BindsPrimaryConstructor()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, CustomerRecordDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var id = Guid.NewGuid();
        var result = mapper.Map<CustomerRecordDto>(new CustomerEntity(id, "Ada", "ada@example.com"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Should().Be(new CustomerRecordDto(id, "Ada", "ada@example.com"));
        plan.Members.Should().OnlyContain(member => member.Decision == "ConstructorBound");
    }

    [Fact]
    public void Map_WithImmutableDestination_BindsConstructorAndExplicitMemberSource()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<CustomerEntity, ImmutableCustomerDto>()
                    .ForMember(destination => destination.DisplayName, member => member
                        .MapFrom(source => source.Name)
                        .Required());
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var id = Guid.NewGuid();
        var result = mapper.Map<ImmutableCustomerDto>(new CustomerEntity(id, "Ada", "ada@example.com"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Id.Should().Be(id);
        result.DisplayName.Should().Be("Ada");
        plan.Members.Should().Contain(member =>
            member.DestinationMember == nameof(ImmutableCustomerDto.DisplayName) &&
            member.Decision == "ConstructorBound" &&
            member.Reason.Contains("Bound through destination constructor."));
    }

    [Fact]
    public void Map_WithAmbiguousConstructorBinding_FailsClearly()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, AmbiguousConstructorDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<AmbiguousConstructorDto>(new CustomerEntity(Guid.NewGuid(), "Ada", "ada@example.com"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC010*multiple equally specific mappable constructors*");
    }

    [Fact]
    public void MapInto_WithoutExplicitUpdateMapping_FailsClearly()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<PatchCustomerDto, CustomerPatchResult>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IConventionMapper>();
        var destination = new CustomerPatchResult { Email = "old@example.com" };

        var act = () => mapper.MapInto(new PatchCustomerDto(true, "ada@example.com"), destination);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*requires EnableUpdateMapping*");
    }

    [Fact]
    public void MapInto_WithCondition_UpdatesExistingDestinationOnlyWhenPredicatePasses()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<PatchCustomerDto, CustomerPatchResult>()
                    .EnableUpdateMapping()
                    .ForMember(destination => destination.Email, member => member.Condition(source => source.HasEmail));
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IConventionMapper>();
        var destination = new CustomerPatchResult { Email = "old@example.com" };

        var sameDestination = mapper.MapInto(new PatchCustomerDto(false, "ada@example.com"), destination);
        sameDestination.Should().BeSameAs(destination);
        destination.Email.Should().Be("old@example.com");

        mapper.MapInto(new PatchCustomerDto(true, "ada@example.com"), destination);

        destination.Email.Should().Be("ada@example.com");
    }

    [Fact]
    public void MapInto_WithSensitiveDestinationWrite_BlocksUnlessAllowed()
    {
        using var blockedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<SecretEntity, SecretDto>()
                .EnableUpdateMapping();
        }).BuildServiceProvider();
        var blockedMapper = blockedProvider.GetRequiredService<IConventionMapper>();

        var blocked = () => blockedMapper.MapInto(new SecretEntity("new-token"), new SecretDto { ApiToken = "old-token" });

        blocked.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*AFC004*AllowSensitiveMember*");

        using var allowedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<SecretEntity, SecretDto>()
                .EnableUpdateMapping()
                .AllowSensitiveMember(nameof(SecretDto.ApiToken));
        }).BuildServiceProvider();
        var destination = new SecretDto { ApiToken = "old-token" };

        allowedProvider.GetRequiredService<IConventionMapper>().MapInto(new SecretEntity("new-token"), destination);

        destination.ApiToken.Should().Be("new-token");
    }

    [Fact]
    public void Map_WithSafeCollectionShape_MapsSameElementCollections()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<TagSource, TagDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<TagDto>(new TagSource(["alpha", "beta"]));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Tags.Should().Equal("alpha", "beta");
        plan.Members.Single(member => member.DestinationMember == nameof(TagDto.Tags))
            .Decision.Should().Be("Collection");
    }

    [Fact]
    public void Map_WithFlatteningEnabled_MapsNestedSourceMembersToFlatDestination()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<CustomerWithAddress, FlatCustomerDto>()
                    .EnableFlattening();
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<FlatCustomerDto>(new CustomerWithAddress(new CustomerAddress("Cairo")));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.AddressCity.Should().Be("Cairo");
        plan.Members.Single(member => member.DestinationMember == nameof(FlatCustomerDto.AddressCity))
            .Decision.Should().Be("Flattened");
    }

    [Fact]
    public void Map_WithUnflatteningEnabled_MapsFlatSourceMembersToNestedDestinationPaths()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<FlatCustomerDto, CustomerWithWritableAddress>()
                    .EnableUnflattening();
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<CustomerWithWritableAddress>(new FlatCustomerDto { AddressCity = "Cairo" });
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Address.City.Should().Be("Cairo");
        plan.Members.Single(member => member.DestinationMember == "Address.City")
            .Decision.Should().Be("Unflattened");
    }

    [Fact]
    public void Map_WithReverseMap_RequiresExplicitReverseRegistration()
    {
        using var blockedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, ReadCustomerDto>();
        }).BuildServiceProvider();
        var blocked = () => blockedProvider.GetRequiredService<IMapper>()
            .Map<CustomerEntity>(new ReadCustomerDto { Id = Guid.NewGuid(), Name = "Ada", Email = "ada@example.com" });

        blocked.Should().Throw<InvalidOperationException>().WithMessage("*No mapping rule registered*");

        using var allowedProvider = CreateServices(catalog =>
        {
            catalog.CreateMap<CustomerEntity, ReadCustomerDto>()
                .ReverseMap();
        }).BuildServiceProvider();

        var id = Guid.NewGuid();
        var result = allowedProvider.GetRequiredService<IMapper>()
            .Map<CustomerEntity>(new ReadCustomerDto { Id = id, Name = "Ada", Email = "ada@example.com" });

        result.Should().Be(new CustomerEntity(id, "Ada", "ada@example.com"));
    }

    [Fact]
    public void Map_WithIncludeMembers_MapsFromIncludedSourceMemberChildren()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<CustomerEnvelope, ContactDto>()
                    .IncludeMembers(source => source.Contact);
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<ContactDto>(new CustomerEnvelope(new ContactInfo("ada@example.com")));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Email.Should().Be("ada@example.com");
        plan.Members.Single(member => member.DestinationMember == nameof(ContactDto.Email))
            .Decision.Should().Be("IncludedMember");
    }

    [Fact]
    public void Map_WithCustomSourceExpression_MapsConfiguredExpression()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<PersonName, PersonNameDto>()
                    .ForMember(destination => destination.FullName, member => member
                        .MapFrom(source => source.FirstName + " " + source.LastName));
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<PersonNameDto>(new PersonName("Ada", "Lovelace"));

        result.FullName.Should().Be("Ada Lovelace");
    }

    [Fact]
    public void Map_WithCustomDestinationPath_MapsConfiguredNestedPath()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<AddressPatchDto, CustomerWithWritableAddress>()
                    .ForPath(destination => destination.Address.City, member => member.MapFrom(source => source.City));
            }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<CustomerWithWritableAddress>(new AddressPatchDto("Cairo"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Address.City.Should().Be("Cairo");
        plan.Members.Should().Contain(member => member.DestinationMember == "Address.City");
    }

    [Fact]
    public void Map_WithResolver_MapsResolvedValueAndReportsResolver()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<PersonName, PersonNameDto>()
                    .ForMember(destination => destination.FullName, member => member.ResolveUsing<FullNameResolver>());
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<PersonNameDto>(new PersonName("Ada", "Lovelace"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.FullName.Should().Be("Ada Lovelace");
        plan.Members.Single(member => member.DestinationMember == nameof(PersonNameDto.FullName))
            .Decision.Should().Be("Resolved");
        plan.Findings.Should().Contain(finding =>
            finding.Code == "AFC013" &&
            finding.Member == nameof(PersonNameDto.FullName));
    }

    [Fact]
    public void Map_WithValueTransformer_AppliesTransformerAndReportsIt()
    {
        using var provider = CreateServices(
            catalog =>
            {
                catalog.AddValueTransformer<string>(value => value?.Trim());
                catalog.CreateMap<ContactInfo, ContactDto>();
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<ContactDto>(new ContactInfo(" ada@example.com "));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.Email.Should().Be("ada@example.com");
        plan.Members.Single(member => member.DestinationMember == nameof(ContactDto.Email))
            .Decision.Should().Be("Transformed");
        plan.Findings.Should().Contain(finding =>
            finding.Code == "AFC014" &&
            finding.Member == nameof(ContactDto.Email));
    }

    [Fact]
    public void Map_WithBeforeAndAfterHooks_RunsHooksAroundMemberAssignmentAndReportsThem()
    {
        var order = new List<string>();
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<ContactInfo, HookedContactDto>()
                    .BeforeMap((_, destination) =>
                    {
                        order.Add("before:" + (destination.Email ?? "null"));
                        destination.BeforeWasCalled = true;
                    })
                    .AfterMap((_, destination) =>
                    {
                        order.Add("after:" + destination.Email);
                        destination.AfterWasCalled = true;
                    });
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<HookedContactDto>(new ContactInfo("ada@example.com"));
        var plan = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans().Single();

        result.BeforeWasCalled.Should().BeTrue();
        result.AfterWasCalled.Should().BeTrue();
        order.Should().Equal("before:null", "after:ada@example.com");
        plan.Findings.Should().Contain(finding => finding.Code == "AFC015");
        plan.Findings.Should().Contain(finding => finding.Code == "AFC016");
    }

    [Fact]
    public void MapInto_WithBeforeAndAfterHooks_RunsHooksAroundExistingDestinationUpdate()
    {
        var order = new List<string>();
        using var provider = CreateServices(
            catalog =>
            {
                catalog.CreateMap<ContactInfo, HookedContactDto>()
                    .EnableUpdateMapping()
                    .BeforeMap((_, destination) => order.Add("before:" + destination.Email))
                    .AfterMap((_, destination) => order.Add("after:" + destination.Email));
            },
            options => options.StrictMode = false).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IConventionMapper>();
        var destination = new HookedContactDto { Email = "old@example.com" };

        mapper.MapInto(new ContactInfo("new@example.com"), destination);

        destination.Email.Should().Be("new@example.com");
        order.Should().Equal("before:old@example.com", "after:new@example.com");
    }

    [Fact]
    public void Map_WithIncludeBase_MapsDerivedPairAndReportsInheritance()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<AnimalEntity, AnimalDto>();
            catalog.CreateMap<DogEntity, DogDto>()
                .IncludeBase<AnimalEntity, AnimalDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<DogDto>(new DogEntity("Ada", "Retriever"));
        var derivedPlan = provider.GetRequiredService<IMappingPlanProvider>()
            .GetMappingPlans()
            .Single(plan => plan.DestinationType.EndsWith(nameof(DogDto), StringComparison.Ordinal));

        result.Name.Should().Be("Ada");
        result.Breed.Should().Be("Retriever");
        derivedPlan.Findings.Should().Contain(finding => finding.Code == "AFC017");
    }

    [Fact]
    public void Map_WithIncludeDerived_DispatchesPolymorphicSourceToDerivedDestination()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<AnimalEntity, AnimalDto>()
                .IncludeDerived<DogEntity, DogDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var result = mapper.Map<AnimalDto>(new DogEntity("Ada", "Retriever"));
        var plans = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans();

        result.Should().BeOfType<DogDto>();
        ((DogDto)result).Breed.Should().Be("Retriever");
        plans.Single(plan => plan.DestinationType.EndsWith(nameof(AnimalDto), StringComparison.Ordinal))
            .Findings.Should().Contain(finding => finding.Code == "AFC018");
        plans.Single(plan => plan.DestinationType.EndsWith(nameof(DogDto), StringComparison.Ordinal))
            .Findings.Should().Contain(finding => finding.Code == "AFC019");
    }

    [Fact]
    public void Map_WithoutIncludeDerived_DoesNotDispatchPolymorphicSource()
    {
        using var provider = CreateServices(catalog =>
        {
            catalog.CreateMap<AnimalEntity, AnimalDto>();
            catalog.CreateMap<DogEntity, DogDto>();
        }).BuildServiceProvider();
        var mapper = provider.GetRequiredService<IMapper>();

        var act = () => mapper.Map<AnimalDto>(new DogEntity("Ada", "Retriever"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*No mapping rule registered*DogEntity*AnimalDto*");
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

    private sealed record CustomerRecordDto(Guid Id, string Name, string Email);

    private sealed record TagSource(string[] Tags);

    private sealed record CustomerWithAddress(CustomerAddress Address);

    private sealed record CustomerAddress(string City);

    private sealed record CustomerEnvelope(ContactInfo Contact);

    private sealed record ContactInfo(string Email);

    private sealed record PersonName(string FirstName, string LastName);

    private sealed record AddressPatchDto(string City);

    private class AnimalEntity
    {
        public AnimalEntity(string name)
        {
            Name = name;
        }

        public string Name { get; }
    }

    private sealed class DogEntity : AnimalEntity
    {
        public DogEntity(string name, string breed)
            : base(name)
        {
            Breed = breed;
        }

        public string Breed { get; }
    }

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

    private sealed class ImmutableCustomerDto
    {
        public ImmutableCustomerDto(Guid id, string displayName)
        {
            Id = id;
            DisplayName = displayName;
        }

        public Guid Id { get; }

        public string DisplayName { get; }
    }

    private sealed class AmbiguousConstructorDto
    {
        public AmbiguousConstructorDto(string name)
        {
            Name = name;
        }

        public AmbiguousConstructorDto(Guid id)
        {
            Id = id;
        }

        public Guid Id { get; }

        public string? Name { get; }
    }

    private sealed class TagDto
    {
        public List<string> Tags { get; set; } = [];
    }

    private sealed class FlatCustomerDto
    {
        public string? AddressCity { get; set; }
    }

    private sealed class CustomerWithWritableAddress
    {
        public WritableCustomerAddress Address { get; set; } = new();
    }

    private sealed class WritableCustomerAddress
    {
        public string? City { get; set; }
    }

    private sealed class ContactDto
    {
        public string? Email { get; set; }
    }

    private sealed class HookedContactDto
    {
        public bool AfterWasCalled { get; set; }

        public bool BeforeWasCalled { get; set; }

        public string? Email { get; set; }
    }

    private sealed class PersonNameDto
    {
        public string? FullName { get; set; }
    }

    private class AnimalDto
    {
        public string? Name { get; set; }
    }

    private sealed class DogDto : AnimalDto
    {
        public string? Breed { get; set; }
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

    private sealed class FullNameResolver : IConventionValueResolver<PersonName, string?>
    {
        public string Resolve(PersonName source)
        {
            return source.FirstName + " " + source.LastName;
        }
    }
}
