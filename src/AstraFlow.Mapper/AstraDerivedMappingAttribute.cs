namespace AstraFlow.Mapper;

/// <summary>Declares one source-to-destination runtime subtype pair for a generated collection mapping.</summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true, Inherited = false)]
public sealed class AstraDerivedMappingAttribute : Attribute
{
    /// <summary>Creates a runtime subtype mapping for a generated collection projection.</summary>
    /// <param name="sourceType">A concrete subtype of the collection source element.</param>
    /// <param name="destinationType">A concrete subtype of the collection destination element.</param>
    public AstraDerivedMappingAttribute(Type sourceType, Type destinationType)
    {
        SourceType = sourceType;
        DestinationType = destinationType;
    }

    /// <summary>Gets the source subtype.</summary>
    public Type SourceType { get; }

    /// <summary>Gets the destination subtype.</summary>
    public Type DestinationType { get; }
}
