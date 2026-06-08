using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for AstraFlow projection plan tests.
/// </summary>
public static class ProjectionPlanAssertions
{
    /// <summary>
    /// Asserts that a projection plan collection contains a static or parameterized projection plan.
    /// </summary>
    public static ProjectionPlan ShouldHaveProjectionPlan<TSource, TDestination>(
        this IReadOnlyCollection<ProjectionPlan> plans,
        string? name = null)
    {
        return plans.ShouldHaveProjectionPlan(
            GetDisplayName(typeof(TSource)),
            GetDisplayName(typeof(TDestination)),
            name);
    }

    /// <summary>
    /// Asserts that a projection plan collection contains a parameterized projection plan.
    /// </summary>
    public static ProjectionPlan ShouldHaveParameterizedProjectionPlan<TSource, TDestination, TParameters>(
        this IReadOnlyCollection<ProjectionPlan> plans,
        string? name = null)
    {
        if (plans is null)
        {
            throw new ArgumentNullException(nameof(plans));
        }

        var sourceType = GetDisplayName(typeof(TSource));
        var destinationType = GetDisplayName(typeof(TDestination));
        var parameterType = GetDisplayName(typeof(TParameters));
        var plan = plans.FirstOrDefault(candidate =>
            string.Equals(candidate.SourceType, sourceType, StringComparison.Ordinal) &&
            string.Equals(candidate.DestinationType, destinationType, StringComparison.Ordinal) &&
            string.Equals(candidate.ProjectionName, name, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(candidate.ParameterType, parameterType, StringComparison.Ordinal));

        if (plan is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{sourceType}' to '{destinationType}'{FormatName(name)} to use parameter type '{parameterType}', but it was not present.");
        }

        return plan;
    }

    /// <summary>
    /// Asserts that a projection plan collection contains a projection plan by display names.
    /// </summary>
    public static ProjectionPlan ShouldHaveProjectionPlan(
        this IReadOnlyCollection<ProjectionPlan> plans,
        string sourceType,
        string destinationType,
        string? name = null)
    {
        if (plans is null)
        {
            throw new ArgumentNullException(nameof(plans));
        }

        if (string.IsNullOrWhiteSpace(sourceType))
        {
            throw new ArgumentException("Source type is required.", nameof(sourceType));
        }

        if (string.IsNullOrWhiteSpace(destinationType))
        {
            throw new ArgumentException("Destination type is required.", nameof(destinationType));
        }

        var plan = plans.FirstOrDefault(candidate =>
            string.Equals(candidate.SourceType, sourceType, StringComparison.Ordinal) &&
            string.Equals(candidate.DestinationType, destinationType, StringComparison.Ordinal) &&
            string.Equals(candidate.ProjectionName, name, StringComparison.OrdinalIgnoreCase));
        if (plan is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{sourceType}' to '{destinationType}'{FormatName(name)}, but it was not present.");
        }

        return plan;
    }

    /// <summary>
    /// Asserts that a projection plan has no plan findings.
    /// </summary>
    public static ProjectionPlan ShouldHaveNoProjectionPlanFindings(this ProjectionPlan plan)
    {
        if (plan is null)
        {
            throw new ArgumentNullException(nameof(plan));
        }

        if (plan.Findings.Count > 0)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{plan.SourceType}' to '{plan.DestinationType}' to have no findings, but found {plan.Findings.Count}.");
        }

        return plan;
    }

    /// <summary>
    /// Asserts that a projection plan contains a parameter member.
    /// </summary>
    public static ProjectionParameterMember ShouldHaveProjectionParameter(
        this ProjectionPlan plan,
        string parameterName)
    {
        if (plan is null)
        {
            throw new ArgumentNullException(nameof(plan));
        }

        if (string.IsNullOrWhiteSpace(parameterName))
        {
            throw new ArgumentException("Parameter name is required.", nameof(parameterName));
        }

        var parameter = plan.Parameters.FirstOrDefault(candidate =>
            string.Equals(candidate.Name, parameterName, StringComparison.Ordinal));
        if (parameter is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{plan.SourceType}' to '{plan.DestinationType}' to contain parameter '{parameterName}', but it was not present.");
        }

        return parameter;
    }

    /// <summary>
    /// Asserts that a projection plan contains a parameter member with the supplied type display name.
    /// </summary>
    public static ProjectionParameterMember ShouldHaveProjectionParameter(
        this ProjectionPlan plan,
        string parameterName,
        string parameterType)
    {
        if (string.IsNullOrWhiteSpace(parameterType))
        {
            throw new ArgumentException("Parameter type is required.", nameof(parameterType));
        }

        var parameter = plan.ShouldHaveProjectionParameter(parameterName);
        if (!string.Equals(parameter.Type, parameterType, StringComparison.Ordinal))
        {
            throw new AstraFlowAssertionException(
                $"Expected projection parameter '{parameterName}' to use type '{parameterType}', but found '{parameter.Type}'.");
        }

        return parameter;
    }

    /// <summary>
    /// Asserts that a projection plan contains a sensitive parameter member.
    /// </summary>
    public static ProjectionParameterMember ShouldHaveSensitiveProjectionParameter(
        this ProjectionPlan plan,
        string parameterName)
    {
        var parameter = plan.ShouldHaveProjectionParameter(parameterName);
        if (!parameter.IsSensitive)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection parameter '{parameterName}' to be marked sensitive, but it was not.");
        }

        return parameter;
    }

    /// <summary>
    /// Asserts that a projection plan contains a non-sensitive parameter member.
    /// </summary>
    public static ProjectionParameterMember ShouldHaveNonSensitiveProjectionParameter(
        this ProjectionPlan plan,
        string parameterName)
    {
        var parameter = plan.ShouldHaveProjectionParameter(parameterName);
        if (parameter.IsSensitive)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection parameter '{parameterName}' to be marked non-sensitive, but it was sensitive.");
        }

        return parameter;
    }

    /// <summary>
    /// Asserts that a projection plan contains a destination member decision.
    /// </summary>
    public static ProjectionPlanMember ShouldHaveProjectionMember(
        this ProjectionPlan plan,
        string destinationMember,
        string? decision = null)
    {
        if (plan is null)
        {
            throw new ArgumentNullException(nameof(plan));
        }

        if (string.IsNullOrWhiteSpace(destinationMember))
        {
            throw new ArgumentException("Destination member is required.", nameof(destinationMember));
        }

        var member = plan.Members.FirstOrDefault(candidate =>
            string.Equals(candidate.DestinationMember, destinationMember, StringComparison.Ordinal) &&
            (decision is null || string.Equals(candidate.Decision, decision, StringComparison.Ordinal)));
        if (member is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{plan.SourceType}' to '{plan.DestinationType}' to contain member '{destinationMember}'{FormatDecision(decision)}, but it was not present.");
        }

        return member;
    }

    /// <summary>
    /// Asserts that a projection plan contains a finding with the supplied code.
    /// </summary>
    public static ProjectionPlanFinding ShouldHaveProjectionPlanFinding(
        this ProjectionPlan plan,
        string code)
    {
        if (plan is null)
        {
            throw new ArgumentNullException(nameof(plan));
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Finding code is required.", nameof(code));
        }

        var finding = plan.Findings.FirstOrDefault(candidate =>
            string.Equals(candidate.Code, code, StringComparison.Ordinal));
        if (finding is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected projection plan '{plan.SourceType}' to '{plan.DestinationType}' to contain finding '{code}', but it was not present.");
        }

        return finding;
    }

    private static string FormatName(string? name)
    {
        return string.IsNullOrWhiteSpace(name) ? string.Empty : $" named '{name}'";
    }

    private static string FormatDecision(string? decision)
    {
        return string.IsNullOrWhiteSpace(decision) ? string.Empty : $" with decision '{decision}'";
    }

    private static string GetDisplayName(Type type)
    {
        if (!type.IsGenericType)
        {
            return type.FullName ?? type.Name;
        }

        var genericName = type.GetGenericTypeDefinition().FullName ?? type.Name;
        var tickIndex = genericName.IndexOf('`');
        if (tickIndex >= 0)
        {
            genericName = genericName.Substring(0, tickIndex);
        }

        var arguments = string.Join(", ", type.GetGenericArguments().Select(GetDisplayName));
        return $"{genericName}<{arguments}>";
    }
}
