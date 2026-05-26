using System.Linq.Expressions;

namespace AstraFlow.Mapper;

/// <summary>
/// Represents an explicit query projection that accepts a parameter object.
/// Parameterized projections keep tenant, user, culture, and current-time values visible in source code.
/// </summary>
/// <typeparam name="TSource">The source query element type.</typeparam>
/// <typeparam name="TDestination">The projected DTO type.</typeparam>
/// <typeparam name="TParameters">The projection parameter object type.</typeparam>
public interface IParameterizedProjection<TSource, TDestination, TParameters>
{
    /// <summary>
    /// Gets the parameterized source-to-destination projection expression.
    /// The first parameter is the source query element and the second parameter is the parameter object.
    /// </summary>
    Expression<Func<TSource, TParameters, TDestination>> Expression { get; }
}
