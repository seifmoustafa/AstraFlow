namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMemberMappingDefinition
{
    public ConventionMemberMappingDefinition(string destinationMemberName)
    {
        DestinationMemberName = destinationMemberName;
    }

    public string DestinationMemberName { get; }

    public string? SourceMemberName { get; private set; }

    public Type? SourceMemberType { get; private set; }

    public Func<object, object?>? SourceValueFactory { get; private set; }

    public Func<object?, object?>? Converter { get; private set; }

    public bool HasConverter { get; private set; }

    public Type? ResolverType { get; private set; }

    public bool HasResolver { get; private set; }

    public object? NullSubstitute { get; private set; }

    public bool HasNullSubstitute { get; private set; }

    public Func<object, bool>? Condition { get; private set; }

    public bool HasCondition { get; private set; }

    public bool IsRequired { get; private set; }

    public void SetSourceMember<TSource, TSourceMember>(
        string sourceMemberName,
        Type sourceMemberType,
        Func<TSource, TSourceMember> sourceValueFactory)
    {
        SourceMemberName = sourceMemberName;
        SourceMemberType = sourceMemberType;
        SourceValueFactory = source => sourceValueFactory((TSource)source);
        Converter = null;
        HasConverter = false;
        ResolverType = null;
        HasResolver = false;
    }

    public void SetSourceExpression<TSource, TSourceMember>(
        string sourceMemberName,
        Type sourceMemberType,
        Func<TSource, TSourceMember> sourceValueFactory)
    {
        SourceMemberName = sourceMemberName;
        SourceMemberType = sourceMemberType;
        SourceValueFactory = source => sourceValueFactory((TSource)source);
        Converter = null;
        HasConverter = false;
        ResolverType = null;
        HasResolver = false;
    }

    public void SetConverter<TSource, TSourceMember, TDestinationMember>(
        string sourceMemberName,
        Type sourceMemberType,
        Func<TSource, TSourceMember> sourceValueFactory,
        Func<TSourceMember, TDestinationMember> converter)
    {
        SourceMemberName = sourceMemberName;
        SourceMemberType = sourceMemberType;
        SourceValueFactory = source => sourceValueFactory((TSource)source);
        Converter = value => converter((TSourceMember)value!);
        HasConverter = true;
        ResolverType = null;
        HasResolver = false;
    }

    public void SetResolver<TSource, TDestinationMember, TResolver>()
        where TResolver : IConventionValueResolver<TSource, TDestinationMember>, new()
    {
        SourceMemberName = typeof(TResolver).Name;
        SourceMemberType = typeof(TDestinationMember);
        SourceValueFactory = source => new TResolver().Resolve((TSource)source);
        Converter = null;
        HasConverter = false;
        ResolverType = typeof(TResolver);
        HasResolver = true;
    }

    public void SetNullSubstitute<TDestinationMember>(TDestinationMember value)
    {
        NullSubstitute = value;
        HasNullSubstitute = true;
    }

    public void SetCondition<TSource>(Func<TSource, bool> predicate)
    {
        Condition = source => predicate((TSource)source);
        HasCondition = true;
    }

    public void MarkRequired()
    {
        IsRequired = true;
    }
}
