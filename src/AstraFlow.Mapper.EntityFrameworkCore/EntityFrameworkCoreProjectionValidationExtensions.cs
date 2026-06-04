using AstraFlow.Mapper;
using Microsoft.EntityFrameworkCore;

namespace AstraFlow.Mapper.EntityFrameworkCore;

/// <summary>
/// EF Core validation helpers for AstraFlow projections.
/// </summary>
public static class EntityFrameworkCoreProjectionValidationExtensions
{
    /// <summary>
    /// Validates that EF Core can translate a projection by generating SQL for it.
    /// The query is not executed.
    /// </summary>
    /// <typeparam name="TSource">EF Core entity type.</typeparam>
    /// <typeparam name="TDestination">Projection destination type.</typeparam>
    /// <param name="dbContext">EF Core database context.</param>
    /// <param name="projection">Projection to validate.</param>
    /// <returns>The generated SQL string.</returns>
    public static string ValidateProjectionTranslation<TSource, TDestination>(
        this DbContext dbContext,
        IProjection<TSource, TDestination> projection)
        where TSource : class
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(projection);

        return dbContext
            .Set<TSource>()
            .Select(projection.Expression)
            .ToQueryString();
    }

    /// <summary>
    /// Validates that EF Core can translate a parameterized projection by generating SQL for it.
    /// The query is not executed.
    /// </summary>
    public static string ValidateProjectionTranslation<TSource, TDestination, TParameters>(
        this DbContext dbContext,
        IParameterizedProjection<TSource, TDestination, TParameters> projection,
        TParameters parameters)
        where TSource : class
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(projection);

        return dbContext
            .Set<TSource>()
            .ProjectWith(projection, parameters)
            .ToQueryString();
    }

    /// <summary>
    /// Validates every registered projection whose source type can be treated as an EF Core entity.
    /// The queries are translated to SQL but not executed.
    /// </summary>
    /// <param name="dbContext">EF Core database context.</param>
    /// <param name="registry">AstraFlow projection registry.</param>
    /// <returns>Translation validation report.</returns>
    public static EfCoreProjectionValidationReport ValidateProjectionTranslations(
        this DbContext dbContext,
        IProjectionRegistry registry)
    {
        return dbContext.ValidateProjectionTranslations(registry, new Dictionary<Type, object>());
    }

    /// <summary>
    /// Validates every registered projection and uses sample parameter objects for parameterized projections.
    /// The queries are translated to SQL but not executed.
    /// </summary>
    /// <param name="dbContext">EF Core database context.</param>
    /// <param name="registry">AstraFlow projection registry.</param>
    /// <param name="parameterSamples">Sample parameter objects keyed by parameter object type.</param>
    /// <returns>Translation validation report.</returns>
    public static EfCoreProjectionValidationReport ValidateProjectionTranslations(
        this DbContext dbContext,
        IProjectionRegistry registry,
        IReadOnlyDictionary<Type, object> parameterSamples)
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(registry);
        ArgumentNullException.ThrowIfNull(parameterSamples);

        var providerName = dbContext.Database.ProviderName;
        var findings = new List<EfCoreProjectionValidationFinding>();
        var validatedCount = 0;
        foreach (var registration in registry.Registrations)
        {
            try
            {
                object? parameterSample = null;
                if (registration.ParameterType is not null &&
                    !parameterSamples.TryGetValue(registration.ParameterType, out parameterSample))
                {
                    findings.Add(new EfCoreProjectionValidationFinding(
                        "AFPEF003",
                        $"Parameterized projection '{GetDisplayName(registration.ImplementationType)}' requires a sample '{GetDisplayName(registration.ParameterType)}' parameter object for EF Core provider validation.",
                        registration.SourceType,
                        registration.DestinationType,
                        registration.Name,
                        registration.ImplementationType,
                        null,
                        providerName));
                    continue;
                }

                var genericArguments = registration.ParameterType is null
                    ? new[] { registration.SourceType, registration.DestinationType }
                    : new[] { registration.SourceType, registration.DestinationType, registration.ParameterType };
                var method = typeof(EntityFrameworkCoreProjectionValidationExtensions)
                    .GetMethod(
                        registration.ParameterType is null ? nameof(ValidateOne) : nameof(ValidateOneParameterized),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(genericArguments);

                if (registration.ParameterType is null)
                    method.Invoke(null, [dbContext, registry, registration]);
                else
                    method.Invoke(null, [dbContext, registry, registration, parameterSample]);

                validatedCount++;
            }
            catch (Exception ex)
            {
                var actual = ex.InnerException ?? ex;
                var code = dbContext.Model.FindEntityType(registration.SourceType) is null
                    ? "AFPEF002"
                    : "AFPEF001";
                findings.Add(new EfCoreProjectionValidationFinding(
                    code,
                    $"EF Core could not translate projection '{GetDisplayName(registration.ImplementationType)}': {actual.Message}",
                    registration.SourceType,
                    registration.DestinationType,
                    registration.Name,
                    registration.ImplementationType,
                    actual.GetType().FullName,
                    providerName));
            }
        }

        return new EfCoreProjectionValidationReport(findings, providerName, validatedCount);
    }

    private static void ValidateOne<TSource, TDestination>(
        DbContext dbContext,
        IProjectionRegistry registry,
        ProjectionRegistration registration)
        where TSource : class
    {
        var projection = registration.Name is null
            ? registry.Get<TSource, TDestination>()
            : registry.Get<TSource, TDestination>(registration.Name);

        _ = dbContext.ValidateProjectionTranslation(projection);
    }

    private static void ValidateOneParameterized<TSource, TDestination, TParameters>(
        DbContext dbContext,
        IProjectionRegistry registry,
        ProjectionRegistration registration,
        object parameterSample)
        where TSource : class
    {
        if (registry is not IParameterizedProjectionRegistry parameterizedRegistry)
        {
            throw new InvalidOperationException("Projection registry does not support parameterized projection lookup.");
        }

        var projection = registration.Name is null
            ? parameterizedRegistry.GetParameterized<TSource, TDestination, TParameters>()
            : parameterizedRegistry.GetParameterized<TSource, TDestination, TParameters>(registration.Name);

        _ = dbContext.ValidateProjectionTranslation(projection, (TParameters)parameterSample);
    }

    private static string GetDisplayName(Type type)
    {
        if (!type.IsGenericType)
            return type.FullName ?? type.Name;

        var genericName = type.GetGenericTypeDefinition().FullName ?? type.Name;
        var tickIndex = genericName.IndexOf('`', StringComparison.Ordinal);
        if (tickIndex >= 0)
            genericName = genericName[..tickIndex];

        var arguments = string.Join(", ", type.GetGenericArguments().Select(GetDisplayName));
        return $"{genericName}<{arguments}>";
    }
}
