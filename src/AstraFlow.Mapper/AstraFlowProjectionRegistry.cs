using System.Linq.Expressions;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

internal sealed class AstraFlowProjectionRegistry : IProjectionRegistry
{
    private static readonly StringComparer NameComparer = StringComparer.OrdinalIgnoreCase;

    private readonly IServiceProvider _serviceProvider;
    private readonly IReadOnlyList<ProjectionDescriptor> _descriptors;
    private IReadOnlyList<ProjectionEntry>? _entries;

    public AstraFlowProjectionRegistry(
        IServiceProvider serviceProvider,
        IEnumerable<ProjectionDescriptor> descriptors)
    {
        _serviceProvider = serviceProvider;
        _descriptors = descriptors.ToArray();
    }

    public IReadOnlyList<ProjectionRegistration> Registrations =>
        GetEntries()
            .Select(entry => entry.Registration)
            .OrderBy(registration => registration.SourceType.FullName, StringComparer.Ordinal)
            .ThenBy(registration => registration.DestinationType.FullName, StringComparer.Ordinal)
            .ThenBy(registration => registration.Name, NameComparer)
            .ThenBy(registration => registration.ImplementationType.FullName, StringComparer.Ordinal)
            .ToArray();

    public IProjection<TSource, TDestination> Get<TSource, TDestination>()
    {
        var matches = GetEntries()
            .Where(entry =>
                entry.Registration.SourceType == typeof(TSource) &&
                entry.Registration.DestinationType == typeof(TDestination) &&
                entry.Registration.Name is null)
            .ToArray();

        return GetSingle<TSource, TDestination>(matches, null);
    }

    public IProjection<TSource, TDestination> Get<TSource, TDestination>(string name)
    {
        var normalizedName = NormalizeRequiredName(name);
        var matches = GetEntries()
            .Where(entry =>
                entry.Registration.SourceType == typeof(TSource) &&
                entry.Registration.DestinationType == typeof(TDestination) &&
                NameComparer.Equals(entry.Registration.Name, normalizedName))
            .ToArray();

        return GetSingle<TSource, TDestination>(matches, normalizedName);
    }

    public bool TryGet<TSource, TDestination>(out IProjection<TSource, TDestination> projection)
    {
        try
        {
            projection = Get<TSource, TDestination>();
            return true;
        }
        catch (InvalidOperationException)
        {
            projection = default!;
            return false;
        }
    }

    public bool TryGet<TSource, TDestination>(string name, out IProjection<TSource, TDestination> projection)
    {
        try
        {
            projection = Get<TSource, TDestination>(name);
            return true;
        }
        catch (InvalidOperationException)
        {
            projection = default!;
            return false;
        }
    }

    internal IReadOnlyList<ProjectionEntry> GetEntries()
    {
        return _entries ??= _descriptors
            .Select(CreateEntry)
            .ToArray();
    }

    private ProjectionEntry CreateEntry(ProjectionDescriptor descriptor)
    {
        var instance = _serviceProvider.GetRequiredService(descriptor.ImplementationType);
        var name = GetProjectionName(instance, descriptor);
        var registration = new ProjectionRegistration(
            descriptor.SourceType,
            descriptor.DestinationType,
            name,
            descriptor.ServiceType,
            descriptor.ImplementationType,
            descriptor.Lifetime);

        return new ProjectionEntry(registration, instance);
    }

    private static string? GetProjectionName(object instance, ProjectionDescriptor descriptor)
    {
        var namedInterface = descriptor.ImplementationType
            .GetInterfaces()
            .FirstOrDefault(type =>
                type.IsGenericType &&
                type.GetGenericTypeDefinition() == typeof(INamedProjection<,>) &&
                type.GetGenericArguments()[0] == descriptor.SourceType &&
                type.GetGenericArguments()[1] == descriptor.DestinationType);

        if (namedInterface is null)
            return null;

        var name = namedInterface
            .GetProperty(nameof(INamedProjection<object, object>.Name))!
            .GetValue(instance) as string;

        return string.IsNullOrWhiteSpace(name) ? name : name.Trim();
    }

    private static IProjection<TSource, TDestination> GetSingle<TSource, TDestination>(
        IReadOnlyCollection<ProjectionEntry> matches,
        string? name)
    {
        if (matches.Count == 1)
            return (IProjection<TSource, TDestination>)matches.Single().Instance;

        var projectionLabel = name is null
            ? $"unnamed projection from '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}'"
            : $"projection named '{name}' from '{typeof(TSource).FullName}' to '{typeof(TDestination).FullName}'";

        if (matches.Count == 0)
            throw new InvalidOperationException($"No {projectionLabel} is registered.");

        var implementations = string.Join(
            ", ",
            matches
                .Select(match => match.Registration.ImplementationType.FullName)
                .OrderBy(value => value, StringComparer.Ordinal));

        throw new InvalidOperationException(
            $"Multiple {projectionLabel} registrations were found: {implementations}.");
    }

    private static string NormalizeRequiredName(string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return name.Trim();
    }

    internal sealed record ProjectionEntry(ProjectionRegistration Registration, object Instance)
    {
        public LambdaExpression? GetExpression()
        {
            var expressionProperty = Registration.ServiceType.GetProperty(nameof(IProjection<object, object>.Expression));
            return expressionProperty?.GetValue(Instance) as LambdaExpression;
        }
    }
}
