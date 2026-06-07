using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.IntegrationTests;

public sealed class AstraFlowRegistrationTests
{
    [Fact]
    public async Task AddAstraFlow_RegistersMediatorAndMapperTogether()
    {
        var services = new ServiceCollection();
        services.AddAstraFlow(assemblyMarkerTypes: typeof(AstraFlowRegistrationTests));

        using var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<Mediator.ISender>();
        var mapper = provider.GetRequiredService<Mapper.IMapper>();

        var response = await sender.Send(new SampleRequest("Alpha"));
        var mapped = mapper.Map<SampleResponse>(new SampleEntity(response));

        mapped.Name.Should().Be("handled:Alpha");
    }

    [Fact]
    public async Task AddAstraFlow_WorksFromScopedMicrosoftDependencyInjectionConsumer()
    {
        var services = new ServiceCollection();
        services.AddAstraFlow(assemblyMarkerTypes: typeof(AstraFlowRegistrationTests));

        using var provider = services.BuildServiceProvider(validateScopes: true);
        using var scope = provider.CreateScope();

        var sender = scope.ServiceProvider.GetRequiredService<Mediator.ISender>();
        var mapper = scope.ServiceProvider.GetRequiredService<Mapper.IMapper>();

        var response = await sender.Send(new SampleRequest("Scoped"));
        var mapped = mapper.Map<SampleResponse>(new SampleEntity(response));

        mapped.Name.Should().Be("handled:Scoped");
    }

    public sealed record SampleRequest(string Name) : Mediator.IRequest<string>;

    public sealed class SampleRequestHandler : Mediator.IRequestHandler<SampleRequest, string>
    {
        public Task<string> Handle(SampleRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult($"handled:{request.Name}");
        }
    }

    public sealed record SampleEntity(string Name);

    public sealed record SampleResponse(string Name);

    public sealed class SampleMappingRule : Mapper.IDeclaredObjectMappingRule
    {
        public IReadOnlyCollection<Mapper.ObjectMappingPair> DeclaredMappings { get; } =
        [
            Mapper.ObjectMappingPair.Create<SampleEntity, SampleResponse>()
        ];

        public bool CanMap(Type sourceType, Type destinationType)
        {
            return sourceType == typeof(SampleEntity) && destinationType == typeof(SampleResponse);
        }

        public object? Map(object? source, Type destinationType, Mapper.IMapper mapper)
        {
            var entity = (SampleEntity)source!;
            return new SampleResponse(entity.Name);
        }
    }
}
