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
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (projection is null)
            throw new ArgumentNullException(nameof(projection));

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
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (projection is null)
            throw new ArgumentNullException(nameof(projection));

        return query.Select(projection);
    }

    /// <summary>
    /// Projects a query using an explicit parameterized projection object.
    /// Parameter values are bound into the expression without executing the query.
    /// </summary>
    /// <typeparam name="TSource">The source query element type.</typeparam>
    /// <typeparam name="TDestination">The projected DTO type.</typeparam>
    /// <typeparam name="TParameters">The projection parameter object type.</typeparam>
    /// <param name="query">The source query.</param>
    /// <param name="projection">The parameterized projection to apply.</param>
    /// <param name="parameters">The parameter object to bind into the query expression.</param>
    /// <returns>A query projected to the destination type.</returns>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination, TParameters>(
        this IQueryable<TSource> query,
        IParameterizedProjection<TSource, TDestination, TParameters> projection,
        TParameters parameters)
    {
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (projection is null)
            throw new ArgumentNullException(nameof(projection));

        return query.Select(BindParameters(projection.Expression, parameters));
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
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (registry is null)
            throw new ArgumentNullException(nameof(registry));

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
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (registry is null)
            throw new ArgumentNullException(nameof(registry));

        return query.ProjectWith(registry.Get<TSource, TDestination>(name));
    }

    /// <summary>
    /// Projects a query using the only unnamed parameterized projection registered for the source/destination/parameter tuple.
    /// </summary>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination, TParameters>(
        this IQueryable<TSource> query,
        IParameterizedProjectionRegistry registry,
        TParameters parameters)
    {
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (registry is null)
            throw new ArgumentNullException(nameof(registry));

        return query.ProjectWith(registry.GetParameterized<TSource, TDestination, TParameters>(), parameters);
    }

    /// <summary>
    /// Projects a query using a named parameterized projection registered for the source/destination/parameter tuple.
    /// </summary>
    public static IQueryable<TDestination> ProjectWith<TSource, TDestination, TParameters>(
        this IQueryable<TSource> query,
        IParameterizedProjectionRegistry registry,
        string name,
        TParameters parameters)
    {
        if (query is null)
            throw new ArgumentNullException(nameof(query));
        if (registry is null)
            throw new ArgumentNullException(nameof(registry));

        return query.ProjectWith(registry.GetParameterized<TSource, TDestination, TParameters>(name), parameters);
    }

    private static Expression<Func<TSource, TDestination>> BindParameters<TSource, TDestination, TParameters>(
        Expression<Func<TSource, TParameters, TDestination>> expression,
        TParameters parameters)
    {
        if (expression is null)
            throw new ArgumentNullException(nameof(expression));

        var sourceParameter = expression.Parameters[0];
        var parameterObject = expression.Parameters[1];
        var body = new ParameterBindingVisitor(parameterObject, Expression.Constant(parameters, typeof(TParameters)))
            .Visit(expression.Body)!;

        return Expression.Lambda<Func<TSource, TDestination>>(body, sourceParameter);
    }

    private sealed class ParameterBindingVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;
        private readonly ConstantExpression _value;

        public ParameterBindingVisitor(ParameterExpression parameter, ConstantExpression value)
        {
            _parameter = parameter;
            _value = value;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _parameter ? _value : base.VisitParameter(node);
        }
    }
}
