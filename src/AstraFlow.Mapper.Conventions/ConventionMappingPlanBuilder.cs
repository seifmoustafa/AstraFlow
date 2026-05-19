using System.Reflection;
using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal static class ConventionMappingPlanBuilder
{
    public static MappingPlan Build(ConventionMappingDefinition definition, ConventionMappingOptions options)
    {
        var sourceProperties = GetReadableProperties(definition.SourceType);
        var destinationProperties = GetWritableProperties(definition.DestinationType);
        var usedSourceMembers = new HashSet<string>(StringComparer.Ordinal);
        var members = new List<MappingPlanMember>();
        var findings = new List<MappingPlanFinding>();
        var allowCaseInsensitive = definition.AllowCaseInsensitiveMemberMatching ||
            options.AllowCaseInsensitiveMemberMatching;

        foreach (var destinationProperty in destinationProperties)
        {
            if (definition.IgnoredMembers.Contains(destinationProperty.Name))
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, null, "Ignored", "Destination member is ignored."));
                continue;
            }

            if (definition.IncludedMembers.Count != 0 &&
                !definition.IncludedMembers.Contains(destinationProperty.Name))
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, null, "Ignored", "Destination member is not included."));
                continue;
            }

            var sourceMatches = FindSourceMatches(sourceProperties, destinationProperty.Name, allowCaseInsensitive);
            if (sourceMatches.Length == 0)
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, null, "Unmapped", "No source member matched."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Warning,
                    "AFC001",
                    destinationProperty.Name,
                    $"Destination member '{destinationProperty.Name}' has no matched source member."));
                continue;
            }

            if (sourceMatches.Length > 1)
            {
                var candidates = string.Join(", ", sourceMatches.Select(property => property.Name).OrderBy(name => name, StringComparer.Ordinal));
                members.Add(new MappingPlanMember(destinationProperty.Name, null, "Blocked", "Source member match is ambiguous."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Error,
                    "AFC003",
                    destinationProperty.Name,
                    $"Destination member '{destinationProperty.Name}' matched multiple source members: {candidates}."));
                continue;
            }

            var sourceProperty = sourceMatches[0];
            if (!destinationProperty.PropertyType.IsAssignableFrom(sourceProperty.PropertyType))
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, sourceProperty.Name, "Blocked", "Source and destination member types are incompatible."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Error,
                    "AFC005",
                    destinationProperty.Name,
                    $"Destination member '{destinationProperty.Name}' cannot receive source member '{sourceProperty.Name}' because their types are incompatible."));
                continue;
            }

            if (options.RequireExplicitSensitiveMemberAllow &&
                (IsSensitive(sourceProperty.Name, options) || IsSensitive(destinationProperty.Name, options)) &&
                !definition.AllowedSensitiveMembers.Contains(sourceProperty.Name) &&
                !definition.AllowedSensitiveMembers.Contains(destinationProperty.Name))
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, sourceProperty.Name, "Blocked", "Sensitive member requires explicit allow."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Error,
                    "AFC004",
                    destinationProperty.Name,
                    $"Convention mapping for sensitive member '{destinationProperty.Name}' requires AllowSensitiveMember."));
                continue;
            }

            usedSourceMembers.Add(sourceProperty.Name);
            members.Add(new MappingPlanMember(destinationProperty.Name, sourceProperty.Name, "Mapped", "Matched by convention."));
        }

        foreach (var sourceProperty in sourceProperties.Where(property => !usedSourceMembers.Contains(property.Name)))
        {
            findings.Add(new MappingPlanFinding(
                MappingPlanFindingSeverity.Warning,
                "AFC002",
                sourceProperty.Name,
                $"Source member '{sourceProperty.Name}' is not mapped to the destination."));
        }

        return new MappingPlan(
            GetDisplayName(definition.SourceType),
            GetDisplayName(definition.DestinationType),
            members,
            findings
                .OrderBy(finding => finding.Code, StringComparer.Ordinal)
                .ThenBy(finding => finding.Member, StringComparer.Ordinal)
                .ThenBy(finding => finding.Message, StringComparer.Ordinal)
                .ToArray());
    }

    public static void ThrowIfInvalid(MappingPlan plan, ConventionMappingOptions options)
    {
        var blockingFindings = plan.Findings
            .Where(finding =>
                finding.Severity == MappingPlanFindingSeverity.Error ||
                (options.StrictMode && finding.Severity == MappingPlanFindingSeverity.Warning))
            .ToArray();

        if (blockingFindings.Length == 0)
            return;

        var details = string.Join("; ", blockingFindings.Select(finding => $"{finding.Code}: {finding.Message}"));
        throw new InvalidOperationException(
            $"Convention mapping plan '{plan.SourceType} -> {plan.DestinationType}' is invalid: {details}");
    }

    public static IReadOnlyList<PropertyInfo> GetReadableProperties(Type type)
    {
        return type
            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Where(property => property.GetMethod is { IsPublic: true } && property.GetIndexParameters().Length == 0)
            .OrderBy(property => property.Name, StringComparer.Ordinal)
            .ToArray();
    }

    public static IReadOnlyList<PropertyInfo> GetWritableProperties(Type type)
    {
        return type
            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Where(property => property.SetMethod is { IsPublic: true } && property.GetIndexParameters().Length == 0)
            .OrderBy(property => property.Name, StringComparer.Ordinal)
            .ToArray();
    }

    private static PropertyInfo[] FindSourceMatches(
        IReadOnlyList<PropertyInfo> sourceProperties,
        string destinationMemberName,
        bool allowCaseInsensitive)
    {
        var exact = sourceProperties
            .Where(property => string.Equals(property.Name, destinationMemberName, StringComparison.Ordinal))
            .ToArray();

        if (exact.Length != 0 || !allowCaseInsensitive)
            return exact;

        return sourceProperties
            .Where(property => string.Equals(property.Name, destinationMemberName, StringComparison.OrdinalIgnoreCase))
            .ToArray();
    }

    private static bool IsSensitive(string memberName, ConventionMappingOptions options)
    {
        var normalized = memberName.Replace("_", string.Empty).Replace("-", string.Empty);
        return options.SensitiveMemberNameFragments
            .Where(fragment => !string.IsNullOrWhiteSpace(fragment))
            .Any(fragment => normalized.IndexOf(fragment.Replace("_", string.Empty).Replace("-", string.Empty), StringComparison.OrdinalIgnoreCase) >= 0);
    }

    private static string GetDisplayName(Type type)
    {
        if (!type.IsGenericType)
            return type.FullName ?? type.Name;

        var genericName = type.GetGenericTypeDefinition().FullName ?? type.Name;
        var tickIndex = genericName.IndexOf('`');
        if (tickIndex >= 0)
            genericName = genericName.Substring(0, tickIndex);

        var arguments = string.Join(", ", type.GetGenericArguments().Select(GetDisplayName));
        return $"{genericName}<{arguments}>";
    }
}
