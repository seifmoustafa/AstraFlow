namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Resolves a convention-mapped destination member from a source object.
/// </summary>
/// <typeparam name="TSource">The source type.</typeparam>
/// <typeparam name="TDestinationMember">The destination member type.</typeparam>
public interface IConventionValueResolver<in TSource, out TDestinationMember>
{
    /// <summary>
    /// Resolves the destination member value.
    /// </summary>
    /// <param name="source">The source object.</param>
    /// <returns>The resolved destination member value.</returns>
    TDestinationMember Resolve(TSource source);
}
