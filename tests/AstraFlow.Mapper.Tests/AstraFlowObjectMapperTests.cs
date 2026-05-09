using FluentAssertions;
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

    private static AstraFlowObjectMapper CreateMapper(params IObjectMappingRule[] rules)
    {
        return new AstraFlowObjectMapper(rules);
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
}
