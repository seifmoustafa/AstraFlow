namespace AstraFlow.Mapper;

/// <summary>
/// Adds a machine-checkable catalog to an explicit object mapping rule.
/// Rules that implement this interface can be validated at startup before any request handler uses them.
/// </summary>
public interface IDeclaredObjectMappingRule : IObjectMappingRule
{
    /// <summary>
    /// Gets the source-to-destination pairs owned by this mapping rule.
    /// Every declared pair must be accepted by <see cref="IObjectMappingRule.CanMap"/>.
    /// </summary>
    IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; }
}
