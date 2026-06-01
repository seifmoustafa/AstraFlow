using System.Linq.Expressions;
using AstraFlow.Mapper;
using FluentAssertions;
using Xunit;

namespace AstraFlow.Testing.Tests;

public sealed class MapperAndProjectionAssertionTests
{
    [Fact]
    public void Mapper_assertion_returns_mapped_destination()
    {
        var mapper = new StubMapper((_, _) => new UserDto("admin"));

        var dto = mapper.ShouldMapTo<UserDto>(new User("admin"));

        dto.Name.Should().Be("admin");
    }

    [Fact]
    public void Projection_assertion_resolves_named_projection()
    {
        var projection = new UserProjection();
        var registry = new StubProjectionRegistry(projection);

        var resolved = registry.ShouldResolveProjection<User, UserDto>("list");

        resolved.Should().BeSameAs(projection);
    }

    [Fact]
    public void Projection_assertion_reports_missing_finding()
    {
        var report = new ProjectionValidationReport([]);

        var act = () => report.ShouldHaveProjectionFinding("AFP999");

        act.Should().Throw<AstraFlowAssertionException>();
    }

    [Fact]
    public void Projection_plan_assertion_resolves_parameterized_plan()
    {
        var plan = CreateProjectionPlan();
        IReadOnlyCollection<ProjectionPlan> plans = [plan];

        var resolved = plans.ShouldHaveParameterizedProjectionPlan<User, UserDto, UserProjectionParameters>("list");

        resolved.Should().BeSameAs(plan);
    }

    [Fact]
    public void Projection_plan_assertion_resolves_parameterized_plan_when_static_plan_shares_name()
    {
        var staticPlan = CreateProjectionPlan() with { ParameterType = null, Parameters = [] };
        var parameterizedPlan = CreateProjectionPlan();
        IReadOnlyCollection<ProjectionPlan> plans = [staticPlan, parameterizedPlan];

        var resolved = plans.ShouldHaveParameterizedProjectionPlan<User, UserDto, UserProjectionParameters>("list");

        resolved.Should().BeSameAs(parameterizedPlan);
    }

    [Fact]
    public void Projection_plan_assertions_return_matching_details()
    {
        var plan = CreateProjectionPlan();

        var parameter = plan.ShouldHaveProjectionParameter("TenantId", typeof(Guid).FullName!);
        var member = plan.ShouldHaveProjectionMember("Name", "Constructed");
        var finding = plan.ShouldHaveProjectionPlanFinding("AFP106");

        parameter.Type.Should().Be(typeof(Guid).FullName);
        member.SourceExpression.Should().Be("Name");
        finding.Message.Should().Be("Raw public ID projection risk.");
    }

    [Fact]
    public void Projection_plan_assertions_report_parameter_sensitivity()
    {
        var plan = CreateProjectionPlan();

        var nonSensitive = plan.ShouldHaveNonSensitiveProjectionParameter("TenantId");
        var sensitive = plan.ShouldHaveSensitiveProjectionParameter("AccessToken");

        nonSensitive.IsSensitive.Should().BeFalse();
        sensitive.IsSensitive.Should().BeTrue();
    }

    [Fact]
    public void Projection_plan_assertion_reports_wrong_parameter_type()
    {
        var plan = CreateProjectionPlan();

        var act = () => plan.ShouldHaveProjectionParameter("TenantId", typeof(string).FullName!);

        act.Should().Throw<AstraFlowAssertionException>();
    }

    [Fact]
    public void Projection_plan_assertion_reports_missing_member()
    {
        var plan = CreateProjectionPlan();

        var act = () => plan.ShouldHaveProjectionMember("Missing");

        act.Should().Throw<AstraFlowAssertionException>();
    }

    [Fact]
    public void Projection_plan_assertion_requires_no_findings()
    {
        var plan = CreateProjectionPlan() with { Findings = [] };

        var resolved = plan.ShouldHaveNoProjectionPlanFindings();

        resolved.Should().BeSameAs(plan);
    }

    [Fact]
    public void Test_secure_id_codec_round_trips_guid_deterministically()
    {
        var codec = new TestSecureIdCodec();
        var id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var encoded = codec.Encrypt(id);
        var decoded = codec.TryDecrypt(encoded);

        encoded.Should().Be("test:33333333333333333333333333333333");
        decoded.Should().Be(id);
    }

    private sealed record User(string Name);

    private sealed record UserDto(string Name);

    private sealed record UserProjectionParameters(Guid TenantId);

    private static ProjectionPlan CreateProjectionPlan()
    {
        return new ProjectionPlan(
            typeof(User).FullName!,
            typeof(UserDto).FullName!,
            "list",
            typeof(UserProjection).FullName!,
            typeof(UserProjectionParameters).FullName!,
            [
                new ProjectionParameterMember("AccessToken", typeof(string).FullName!, true),
                new ProjectionParameterMember("TenantId", typeof(Guid).FullName!, false)
            ],
            [
                new ProjectionPlanMember(
                    "Name",
                    "Name",
                    "Constructed",
                    "Destination constructor argument is supplied by the projection expression.")
            ],
            [
                new ProjectionPlanFinding(
                    MappingPlanFindingSeverity.Warning,
                    "AFP106",
                    "Id",
                    "Raw public ID projection risk.")
            ]);
    }

    private sealed class StubMapper(Func<object?, Type, object?> map) : IMapper
    {
        public TDestination Map<TDestination>(object? source)
        {
            return (TDestination)map(source, typeof(TDestination))!;
        }

        public object? Map(object? source, Type destinationType)
        {
            return map(source, destinationType);
        }
    }

    private sealed class UserProjection : INamedProjection<User, UserDto>
    {
        public string Name => "list";

        public Expression<Func<User, UserDto>> Expression => user => new UserDto(user.Name);
    }

    private sealed class StubProjectionRegistry(IProjection<User, UserDto> projection) : IProjectionRegistry
    {
        public IReadOnlyList<ProjectionRegistration> Registrations { get; } = [];

        public IProjection<TSource, TDestination> Get<TSource, TDestination>()
        {
            throw new InvalidOperationException();
        }

        public IProjection<TSource, TDestination> Get<TSource, TDestination>(string name)
        {
            if (TryGet<TSource, TDestination>(name, out var resolved))
            {
                return resolved;
            }

            throw new InvalidOperationException();
        }

        public bool TryGet<TSource, TDestination>(out IProjection<TSource, TDestination> resolved)
        {
            resolved = default!;
            return false;
        }

        public bool TryGet<TSource, TDestination>(
            string name,
            out IProjection<TSource, TDestination> resolved)
        {
            if (typeof(TSource) == typeof(User) &&
                typeof(TDestination) == typeof(UserDto) &&
                name == "list")
            {
                resolved = (IProjection<TSource, TDestination>)projection;
                return true;
            }

            resolved = default!;
            return false;
        }
    }
}
