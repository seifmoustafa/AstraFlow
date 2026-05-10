using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Mapper.Tests;

public sealed class AstraFlowObjectMapperTests
{
    [Fact]
    public void Map_WithRegisteredRule_MapsObject()
    {
        var mapper = CreateMapper(new SampleMappingRule());

        var result = mapper.Map<SampleResponse>(new SampleEntity(Guid.NewGuid(), "Alpha"));

        result.Name.Should().Be("Alpha");
    }

    [Fact]
    public void Map_WithMissingRule_FailsClearly()
    {
        var mapper = CreateMapper();

        var act = () => mapper.Map<SampleResponse>(new SampleEntity(Guid.NewGuid(), "Alpha"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*No mapping rule registered*SampleEntity*SampleResponse*");
    }

    [Fact]
    public void Map_WithDuplicateRules_FailsClearly()
    {
        var mapper = CreateMapper(new SampleMappingRule(), new DuplicateSampleMappingRule());

        var act = () => mapper.Map<SampleResponse>(new SampleEntity(Guid.NewGuid(), "Alpha"));

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*Multiple mapping rules registered*SampleEntity*SampleResponse*");
    }

    [Fact]
    public void Map_WithNullSource_ReturnsDefaultDestination()
    {
        var mapper = CreateMapper(new SampleMappingRule());

        var result = mapper.Map<SampleResponse>(null);

        result.Should().BeNull();
    }

    [Fact]
    public void Map_WithListDestination_MapsEachItem()
    {
        var mapper = CreateMapper(new SampleMappingRule());
        var source = new[]
        {
            new SampleEntity(Guid.NewGuid(), "One"),
            new SampleEntity(Guid.NewGuid(), "Two"),
        };

        var result = mapper.Map<List<SampleResponse>>(source);

        result.Select(x => x.Name).Should().Equal("One", "Two");
    }

    [Fact]
    public void Map_WithArrayDestination_ReturnsArray()
    {
        var mapper = CreateMapper(new SampleMappingRule());
        var source = new[]
        {
            new SampleEntity(Guid.NewGuid(), "One"),
            new SampleEntity(Guid.NewGuid(), "Two"),
        };

        var result = mapper.Map<SampleResponse[]>(source);

        result.Should().BeOfType<SampleResponse[]>();
        result.Select(x => x.Name).Should().Equal("One", "Two");
    }

    [Fact]
    public void Map_WithReadOnlyListDestination_ReturnsCompatibleList()
    {
        var mapper = CreateMapper(new SampleMappingRule());
        var source = new[]
        {
            new SampleEntity(Guid.NewGuid(), "One"),
            new SampleEntity(Guid.NewGuid(), "Two"),
        };

        var result = mapper.Map<IReadOnlyList<SampleResponse>>(source);

        result.Select(x => x.Name).Should().Equal("One", "Two");
    }

    [Fact]
    public void Validate_WithDeclaredRuleCatalog_Passes()
    {
        var validator = new AstraFlowObjectMappingValidator([new SampleMappingRule()]);

        var act = () => validator.Validate(new MappingOptions());

        act.Should().NotThrow();
    }

    [Fact]
    public void Validate_WithUndeclaredRule_FailsClearly()
    {
        var validator = new AstraFlowObjectMappingValidator([new UndeclaredSampleMappingRule()]);

        var act = () => validator.Validate(new MappingOptions());

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*must implement*IDeclaredObjectMappingRule*");
    }

    [Fact]
    public void Validate_WithDuplicateDeclaredPair_FailsClearly()
    {
        var validator = new AstraFlowObjectMappingValidator(
            [new SampleMappingRule(), new DuplicateSampleMappingRule()]);

        var act = () => validator.Validate(new MappingOptions());

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*declared by multiple rules*");
    }

    [Fact]
    public void SecureIdMapper_UsesConfiguredCodec()
    {
        var ids = new SecureIdMapper(new PrefixSecureIdCodec());
        var id = Guid.NewGuid();

        ids.Encrypt(id).Should().Be($"encoded:{id:N}");
        ids.TryDecrypt(ids.Encrypt(id)).Should().Be(id);
    }

    [Fact]
    public void ProjectWith_UsesExplicitQueryableProjection()
    {
        var source = new[]
        {
            new SampleEntity(Guid.NewGuid(), "One"),
            new SampleEntity(Guid.NewGuid(), "Two"),
        }.AsQueryable();

        var result = source.ProjectWith(new SampleProjection()).ToList();

        result.Select(x => x.Name).Should().Equal("One", "Two");
    }

    [Fact]
    public void ProjectionRegistry_WithSingleProjection_ReturnsUnnamedProjection()
    {
        using var provider = CreateServices(typeof(SampleProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var projection = registry.Get<SampleEntity, SampleResponse>();

        projection.Should().BeOfType<SampleProjection>();
    }

    [Fact]
    public void ProjectionRegistry_WithNamedProjection_ReturnsProjectionByName()
    {
        using var provider = CreateServices(typeof(NamedSampleProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var projection = registry.Get<SampleEntity, SampleResponse>("LIST");

        projection.Should().BeOfType<NamedSampleProjection>();
    }

    [Fact]
    public void ProjectionRegistry_WithMissingProjection_TryGetReturnsFalse()
    {
        using var provider = CreateServices(typeof(AstraFlowObjectMapperTests)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var found = registry.TryGet<SampleEntity, SampleResponse>(out var projection);

        found.Should().BeFalse();
        projection.Should().BeNull();
    }

    [Fact]
    public void ProjectionRegistry_WithDuplicateUnnamedProjections_FailsClearly()
    {
        using var provider = CreateServices(typeof(SampleProjection), typeof(DuplicateUnnamedProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var act = () => registry.Get<SampleEntity, SampleResponse>();

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("*Multiple unnamed projection*SampleEntity*SampleResponse*");
    }

    [Fact]
    public void ProjectionValidator_WithDuplicateNamedProjection_ReportsFinding()
    {
        using var provider = CreateServices(typeof(NamedSampleProjection), typeof(DuplicateNamedProjection)).BuildServiceProvider();
        var validator = provider.GetRequiredService<IProjectionValidator>();

        var report = validator.Validate(new MappingOptions());

        report.Findings.Should().Contain(finding => finding.Code == "AFP002");
    }

    [Fact]
    public void ProjectionValidator_WithHighRiskExpression_ReportsFindings()
    {
        using var provider = CreateServices(typeof(RiskyProjection)).BuildServiceProvider();
        var validator = provider.GetRequiredService<IProjectionValidator>();

        var report = validator.Validate(new MappingOptions());

        report.Findings.Select(finding => finding.Code).Should().Contain(["AFP102", "AFP103"]);
    }

    [Fact]
    public void ProjectWith_UsesProjectionRegistry()
    {
        using var provider = CreateServices(typeof(NamedSampleProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();
        var source = new[]
        {
            new SampleEntity(Guid.NewGuid(), "One"),
            new SampleEntity(Guid.NewGuid(), "Two"),
        }.AsQueryable();

        var result = source.ProjectWith<SampleEntity, SampleResponse>(registry, "list").ToList();

        result.Select(x => x.Name).Should().Equal("One", "Two");
    }

    private static AstraFlowObjectMapper CreateMapper(params IObjectMappingRule[] rules)
    {
        return new AstraFlowObjectMapper(rules);
    }

    private static ServiceCollection CreateServices(params Type[] markerTypes)
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper(Array.Empty<Type>());
        foreach (var projectionType in markerTypes)
        {
            foreach (var serviceType in projectionType.GetInterfaces()
                         .Where(type => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IProjection<,>)))
            {
                var arguments = serviceType.GetGenericArguments();
                services.AddScoped(projectionType);
                services.AddScoped(serviceType, provider => provider.GetRequiredService(projectionType));
                services.AddSingleton(new ProjectionDescriptor(
                    arguments[0],
                    arguments[1],
                    serviceType,
                    projectionType,
                    ServiceLifetime.Scoped));
            }
        }

        return services;
    }

    private sealed record SampleEntity(Guid Id, string Name);

    private sealed record SampleResponse(Guid Id, string Name);

    private class SampleMappingRule : IDeclaredObjectMappingRule
    {
        public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
        [
            ObjectMappingPair.Create<SampleEntity, SampleResponse>()
        ];

        public bool CanMap(Type sourceType, Type destinationType)
        {
            return sourceType == typeof(SampleEntity) && destinationType == typeof(SampleResponse);
        }

        public object? Map(object? source, Type destinationType, IMapper mapper)
        {
            var entity = (SampleEntity)source!;
            return new SampleResponse(entity.Id, entity.Name);
        }
    }

    private sealed class DuplicateSampleMappingRule : SampleMappingRule
    {
    }

    private sealed class UndeclaredSampleMappingRule : IObjectMappingRule
    {
        public bool CanMap(Type sourceType, Type destinationType)
        {
            return sourceType == typeof(SampleEntity) && destinationType == typeof(SampleResponse);
        }

        public object? Map(object? source, Type destinationType, IMapper mapper)
        {
            var entity = (SampleEntity)source!;
            return new SampleResponse(entity.Id, entity.Name);
        }
    }

    private sealed class PrefixSecureIdCodec : ISecureIdCodec
    {
        public string Encrypt(Guid id)
        {
            return $"encoded:{id:N}";
        }

        public Guid? TryDecrypt(string? encryptedId)
        {
            if (encryptedId is null)
            {
                return null;
            }

            return Guid.ParseExact(encryptedId.Replace("encoded:", string.Empty, StringComparison.Ordinal), "N");
        }
    }

    private sealed class SampleProjection : IProjection<SampleEntity, SampleResponse>
    {
        public System.Linq.Expressions.Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(entity.Id, entity.Name);
    }

    private sealed class NamedSampleProjection : INamedProjection<SampleEntity, SampleResponse>
    {
        public string Name => "list";

        public System.Linq.Expressions.Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(entity.Id, entity.Name);
    }

    private sealed class DuplicateUnnamedProjection : IProjection<SampleEntity, SampleResponse>
    {
        public System.Linq.Expressions.Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(entity.Id, entity.Name);
    }

    private sealed class DuplicateNamedProjection : INamedProjection<SampleEntity, SampleResponse>
    {
        public string Name => "list";

        public System.Linq.Expressions.Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(entity.Id, entity.Name);
    }

    private sealed class RiskyProjection : IProjection<SampleEntity, SampleResponse>
    {
        public System.Linq.Expressions.Expression<Func<SampleEntity, SampleResponse>> Expression =>
            entity => new SampleResponse(Guid.NewGuid(), Normalize(entity.Name + DateTime.UtcNow.Year));

        private static string Normalize(string value) => value.Trim();
    }

}
