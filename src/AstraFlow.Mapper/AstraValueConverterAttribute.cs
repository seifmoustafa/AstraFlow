namespace AstraFlow.Mapper;

/// <summary>Declares a static conversion method for one generated mapping destination property.</summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
public sealed class AstraValueConverterAttribute : Attribute
{
    /// <summary>Creates a property converter declaration.</summary>
    /// <param name="converterType">The type that declares the converter method.</param>
    /// <param name="methodName">The public or internal static method name.</param>
    public AstraValueConverterAttribute(Type converterType, string methodName)
    {
        ConverterType = converterType;
        MethodName = methodName;
    }

    /// <summary>Gets the converter type.</summary>
    public Type ConverterType { get; }

    /// <summary>Gets the converter method name.</summary>
    public string MethodName { get; }
}
