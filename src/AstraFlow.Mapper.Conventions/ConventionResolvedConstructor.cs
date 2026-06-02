using System.Reflection;

namespace AstraFlow.Mapper.Conventions;

internal sealed record ConventionResolvedConstructor(
    ConstructorInfo? Constructor,
    IReadOnlyList<ConventionResolvedConstructorParameter> Parameters,
    bool CanConstruct,
    string Decision,
    string Reason)
{
    public bool UsesParameterizedConstructor => Constructor is not null && Parameters.Count != 0;

    public static ConventionResolvedConstructor Parameterless { get; } = new(null, Array.Empty<ConventionResolvedConstructorParameter>(), true, "Constructed", "Destination has a parameterless constructor.");
}

