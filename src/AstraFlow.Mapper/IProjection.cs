using System.Linq.Expressions;

namespace AstraFlow.Mapper;

/// <summary>
/// Represents an explicit query projection from an entity/model type to a DTO type.
/// Unlike runtime object mapping, the expression can be translated by LINQ providers such as EF Core.
/// </summary>
/// <typeparam name="TSource">The source query element type.</typeparam>
/// <typeparam name="TDestination">The projected DTO type.</typeparam>
public interface IProjection<TSource, TDestination>
{
    /// <summary>
    /// Gets the source-to-destination projection expression.
    /// Keep this expression provider-translatable: avoid service calls and runtime mapper calls inside it.
    /// </summary>
    Expression<Func<TSource, TDestination>> Expression { get; }
}
