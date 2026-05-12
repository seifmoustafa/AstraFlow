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
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(registry);

        var findings = new List<EfCoreProjectionValidationFinding>();
        foreach (var registration in registry.Registrations)
        {
            try
            {
                var method = typeof(EntityFrameworkCoreProjectionValidationExtensions)
                    .GetMethod(nameof(ValidateOne), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(registration.SourceType, registration.DestinationType);

                method.Invoke(null, [dbContext, registry, registration]);
            }
            catch (Exception ex)
            {
                var actual = ex.InnerException ?? ex;
                findings.Add(new EfCoreProjectionValidationFinding(
                    "AFPEF001",
                    $"EF Core could not translate projection '{GetDisplayName(registration.ImplementationType)}': {actual.Message}",
                    registration.SourceType,
                    registration.DestinationType,
                    registration.Name,
                    registration.ImplementationType,
                    actual.GetType().FullName));
            }
        }

        return new EfCoreProjectionValidationReport(findings);
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
