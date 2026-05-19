using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMapper : IConventionMapper
{
    private readonly IMapper _mapper;
    private readonly ConventionObjectMappingRule _rule;

    public ConventionMapper(IMapper mapper, ConventionObjectMappingRule rule)
    {
        _mapper = mapper;
        _rule = rule;
    }

    public TDestination Map<TDestination>(object? source)
    {
        return _mapper.Map<TDestination>(source);
    }

    public TDestination MapInto<TSource, TDestination>(TSource? source, TDestination destination)
        where TDestination : class
    {
        if (destination is null)
            throw new ArgumentNullException(nameof(destination));

        if (source is null)
            return destination;

        _rule.MapInto(source, destination);
        return destination;
    }
}
