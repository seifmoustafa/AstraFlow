using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for AstraFlow mapper tests.
/// </summary>
public static class MapperAssertions
{
    /// <summary>
    /// Asserts that the mapper can map a source object to a destination type.
    /// </summary>
    public static TDestination ShouldMapTo<TDestination>(
        this IMapper mapper,
        object? source)
    {
        if (mapper is null)
        {
            throw new ArgumentNullException(nameof(mapper));
        }

        try
        {
            return mapper.Map<TDestination>(source);
        }
        catch (Exception exception)
        {
            throw new AstraFlowAssertionException(
                $"Expected mapper to map to '{typeof(TDestination).FullName}', but mapping failed: {exception.Message}");
        }
    }

    /// <summary>
    /// Asserts that mapping fails for a source and destination type.
    /// </summary>
    public static void ShouldFailMappingTo<TDestination>(
        this IMapper mapper,
        object? source)
    {
        if (mapper is null)
        {
            throw new ArgumentNullException(nameof(mapper));
        }

        try
        {
            mapper.Map<TDestination>(source);
        }
        catch
        {
            return;
        }

        throw new AstraFlowAssertionException(
            $"Expected mapper to fail mapping to '{typeof(TDestination).FullName}', but mapping succeeded.");
    }

    /// <summary>
    /// Asserts that mapper catalog validation succeeds.
    /// </summary>
    public static void ShouldValidateMappings(
        this IObjectMappingValidator validator,
        MappingOptions? options = null)
    {
        if (validator is null)
        {
            throw new ArgumentNullException(nameof(validator));
        }

        try
        {
            validator.Validate(options ?? new MappingOptions());
        }
        catch (Exception exception)
        {
            throw new AstraFlowAssertionException(
                $"Expected mapper catalog validation to succeed, but validation failed: {exception.Message}");
        }
    }
}
