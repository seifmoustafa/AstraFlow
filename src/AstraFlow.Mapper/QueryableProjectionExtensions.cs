using System.Linq.Expressions;

namespace AstraFlow.Mapper;

/// <summary>
/// Queryable projection helpers for explicit, provider-translatable DTO selection.
/// These helpers keep query projections explicit so translation behavior stays visible in source code.
/// </summary>
public static class QueryableProjectionExtensions
{
    /// <summary>
    /// Projects a query using an explicit projection object.
    /// </summary>
    /// <typeparam name="TSource">The source query element type.</typeparam>
    /// <typeparam name="TDestination">The projected DTO type.</typeparam>
    /// <param name="query">The source query.</param>
    /// <param name="projection">The explicit projection to apply.</param>
    /// <returns>A query projected to the destination type.</returns>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination>(
        this IQueryable<TSource> query,
        IProjection<TSource, TDestination> projection)
    {
        ArgumentNullException.ThrowIfNull(query);
        ArgumentNullException.ThrowIfNull(projection);

        return query.Select(projection.Expression);
    }

    /// <summary>
    /// Projects a query using an inline expression.
    /// </summary>
    /// <typeparam name="TSource">The source query element type.</typeparam>
    /// <typeparam name="TDestination">The projected DTO type.</typeparam>
    /// <param name="query">The source query.</param>
    /// <param name="projection">The explicit projection expression.</param>
    /// <returns>A query projected to the destination type.</returns>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination>(
        this IQueryable<TSource> query,
        Expression<Func<TSource, TDestination>> projection)
    {
        ArgumentNullException.ThrowIfNull(query);
        ArgumentNullException.ThrowIfNull(projection);

        return query.Select(projection);
    }

    /// <summary>
    /// Projects a query using the only unnamed projection registered for the source/destination pair.
    /// </summary>
    /// <typeparam name="TSource">The source query element type.</typeparam>
    /// <typeparam name="TDestination">The projected DTO type.</typeparam>
    /// <param name="query">The source query.</param>
    /// <param name="registry">Projection registry used to resolve the projection.</param>
    /// <returns>A query projected to the destination type.</returns>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination>(
        this IQueryable<TSource> query,
        IProjectionRegistry registry)
    {
        ArgumentNullException.ThrowIfNull(query);
        ArgumentNullException.ThrowIfNull(registry);

        return query.ProjectWith(registry.Get<TSource, TDestination>());
    }

    /// <summary>
    /// Projects a query using the named projection registered for the source/destination pair.
    /// </summary>
    /// <typeparam name="TSource">The source query element type.</typeparam>
    /// <typeparam name="TDestination">The projected DTO type.</typeparam>
    /// <param name="query">The source query.</param>
    /// <param name="registry">Projection registry used to resolve the projection.</param>
    /// <param name="name">Projection name.</param>
    /// <returns>A query projected to the destination type.</returns>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination>(
        this IQueryable<TSource> query,
        IProjectionRegistry registry,
        string name)
    {
        ArgumentNullException.ThrowIfNull(query);
        ArgumentNullException.ThrowIfNull(registry);

        return query.ProjectWith(registry.Get<TSource, TDestination>(name));
    }
}
