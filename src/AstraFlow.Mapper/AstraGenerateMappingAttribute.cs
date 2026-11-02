namespace AstraFlow.Mapper;

/// <summary>Requests an executable, direct generated mapping for a static partial method.</summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
public sealed class AstraGenerateMappingAttribute : Attribute;
