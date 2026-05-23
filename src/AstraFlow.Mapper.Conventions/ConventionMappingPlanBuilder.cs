using System.Reflection;
using AstraFlow.Mapper;

namespace AstraFlow.Mapper.Conventions;

internal static class ConventionMappingPlanBuilder
{
    public static MappingPlan Build(ConventionMappingDefinition definition, ConventionMappingOptions options)
    {
        return BuildResolvedPlan(definition, options).Plan;
    }

    public static ConventionResolvedMappingPlan BuildResolvedPlan(
        ConventionMappingDefinition definition,
        ConventionMappingOptions options)
    {
        var sourceProperties = GetReadableProperties(definition.SourceType);
        var destinationProperties = GetWritableProperties(definition.DestinationType);
        var usedSourceMembers = new HashSet<string>(StringComparer.Ordinal);
        var members = new List<MappingPlanMember>();
        var resolvedMembers = new List<ConventionResolvedMember>();
        var findings = new List<MappingPlanFinding>();
        var allowCaseInsensitive = definition.AllowCaseInsensitiveMemberMatching ||
            options.AllowCaseInsensitiveMemberMatching;

        foreach (var destinationProperty in destinationProperties)
        {
            definition.MemberMappings.TryGetValue(destinationProperty.Name, out var memberConfiguration);

            if (definition.IgnoredMembers.Contains(destinationProperty.Name))
            {
                var decision = memberConfiguration?.IsRequired == true ? "Blocked" : "Ignored";
                var reason = memberConfiguration?.IsRequired == true
                    ? "Destination member is required but ignored."
                    : "Destination member is ignored.";
                members.Add(new MappingPlanMember(destinationProperty.Name, null, decision, reason));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, decision, reason));

                if (memberConfiguration?.IsRequired == true)
                    AddRequiredFinding(findings, destinationProperty.Name, "Destination member is required but ignored.");

                continue;
            }

            if (definition.IncludedMembers.Count != 0 &&
                !definition.IncludedMembers.Contains(destinationProperty.Name))
            {
                var decision = memberConfiguration?.IsRequired == true ? "Blocked" : "Ignored";
                var reason = memberConfiguration?.IsRequired == true
                    ? "Destination member is required but not included."
                    : "Destination member is not included.";
                members.Add(new MappingPlanMember(destinationProperty.Name, null, decision, reason));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, decision, reason));

                if (memberConfiguration?.IsRequired == true)
                    AddRequiredFinding(findings, destinationProperty.Name, "Destination member is required but not included.");

                continue;
            }

            var sourceResolution = ResolveSourceMember(sourceProperties, destinationProperty.Name, memberConfiguration, allowCaseInsensitive);
            if (sourceResolution.IsAmbiguous)
            {
                var candidates = string.Join(", ", sourceResolution.CandidateNames.OrderBy(name => name, StringComparer.Ordinal));
                members.Add(new MappingPlanMember(destinationProperty.Name, null, "Blocked", "Source member match is ambiguous."));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, "Blocked", "Source member match is ambiguous."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Error,
                    "AFC003",
                    destinationProperty.Name,
                    $"Destination member '{destinationProperty.Name}' matched multiple source members: {candidates}."));
                continue;
            }

            if (sourceResolution.SourceMemberName is null)
            {
                if (memberConfiguration?.HasNullSubstitute == true)
                {
                    var substitutionReason = AddConfigurationReason("Null substitution configured.", memberConfiguration);
                    members.Add(new MappingPlanMember(destinationProperty.Name, null, "Substituted", substitutionReason));
                    resolvedMembers.Add(ConventionResolvedMember.Mappable(
                        destinationProperty,
                        null,
                        memberConfiguration,
                        "Substituted",
                        substitutionReason,
                        null,
                        false,
                        false));
                    continue;
                }

                var decision = memberConfiguration?.IsRequired == true ? "Blocked" : "Unmapped";
                var reason = memberConfiguration?.IsRequired == true
                    ? "Required destination member has no source member."
                    : "No source member matched.";
                members.Add(new MappingPlanMember(destinationProperty.Name, null, decision, reason));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, decision, reason));

                if (memberConfiguration?.IsRequired == true)
                {
                    AddRequiredFinding(findings, destinationProperty.Name, "Required destination member has no matched source member.");
                }
                else
                {
                    findings.Add(new MappingPlanFinding(
                        MappingPlanFindingSeverity.Warning,
                        "AFC001",
                        destinationProperty.Name,
                        $"Destination member '{destinationProperty.Name}' has no matched source member."));
                }

                continue;
            }

            var sourceMemberName = sourceResolution.SourceMemberName;
            var sourceMemberType = sourceResolution.SourceMemberType!;

            if (options.RequireExplicitSensitiveMemberAllow &&
                (IsSensitive(sourceMemberName, options) || IsSensitive(destinationProperty.Name, options)) &&
                !definition.AllowedSensitiveMembers.Contains(sourceMemberName) &&
                !definition.AllowedSensitiveMembers.Contains(destinationProperty.Name))
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, sourceMemberName, "Blocked", "Sensitive member requires explicit allow."));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, "Blocked", "Sensitive member requires explicit allow."));
                findings.Add(new MappingPlanFinding(
                    MappingPlanFindingSeverity.Error,
                    "AFC004",
                    destinationProperty.Name,
                    $"Convention mapping for sensitive member '{destinationProperty.Name}' requires AllowSensitiveMember."));
                continue;
            }

            var compatibility = GetCompatibility(sourceMemberType, destinationProperty.PropertyType, memberConfiguration);
            if (!compatibility.CanMap)
            {
                members.Add(new MappingPlanMember(destinationProperty.Name, sourceMemberName, "Blocked", compatibility.Reason));
                resolvedMembers.Add(ConventionResolvedMember.Blocked(destinationProperty, memberConfiguration, "Blocked", compatibility.Reason));
                findings.Add(new MappingPlanFinding(
                    compatibility.Severity,
                    compatibility.Code,
                    destinationProperty.Name,
                    compatibility.Message(destinationProperty.Name, sourceMemberName)));
                continue;
            }

            usedSourceMembers.Add(sourceMemberName);
            var decisionText = GetDecisionText(memberConfiguration, compatibility);
            var mappedReason = AddConfigurationReason(compatibility.Reason, memberConfiguration);
            members.Add(new MappingPlanMember(destinationProperty.Name, sourceMemberName, decisionText, mappedReason));
            resolvedMembers.Add(ConventionResolvedMember.Mappable(
                destinationProperty,
                sourceResolution.SourceProperty,
                memberConfiguration,
                decisionText,
                mappedReason,
                sourceResolution.SourceValueFactory,
                compatibility.RequiresEnumToString,
                compatibility.RequiresEnumToEnum));
        }

        foreach (var sourceProperty in sourceProperties.Where(property => !usedSourceMembers.Contains(property.Name)))
        {
            findings.Add(new MappingPlanFinding(
                MappingPlanFindingSeverity.Warning,
                "AFC002",
                sourceProperty.Name,
                $"Source member '{sourceProperty.Name}' is not mapped to the destination."));
        }

        var plan = new MappingPlan(
            GetDisplayName(definition.SourceType),
            GetDisplayName(definition.DestinationType),
            members,
            findings
                .OrderBy(finding => finding.Code, StringComparer.Ordinal)
                .ThenBy(finding => finding.Member, StringComparer.Ordinal)
                .ThenBy(finding => finding.Message, StringComparer.Ordinal)
                .ToArray());

        return new ConventionResolvedMappingPlan(plan, resolvedMembers);
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

    private static SourceMemberResolution ResolveSourceMember(
        IReadOnlyList<PropertyInfo> sourceProperties,
        string destinationMemberName,
        ConventionMemberMappingDefinition? memberConfiguration,
        bool allowCaseInsensitive)
    {
        if (memberConfiguration?.SourceMemberName is not null)
        {
            var sourceProperty = sourceProperties.SingleOrDefault(property =>
                string.Equals(property.Name, memberConfiguration.SourceMemberName, StringComparison.Ordinal));
            return new SourceMemberResolution(
                memberConfiguration.SourceMemberName,
                memberConfiguration.SourceMemberType,
                sourceProperty,
                memberConfiguration.SourceValueFactory,
                false,
                Array.Empty<string>());
        }

        var sourceMatches = FindSourceMatches(sourceProperties, destinationMemberName, allowCaseInsensitive);
        if (sourceMatches.Length == 0)
            return SourceMemberResolution.None;

        if (sourceMatches.Length > 1)
        {
            return new SourceMemberResolution(
                null,
                null,
                null,
                null,
                true,
                sourceMatches.Select(property => property.Name).ToArray());
        }

        var match = sourceMatches[0];
        return new SourceMemberResolution(
            match.Name,
            match.PropertyType,
            match,
            source => match.GetValue(source),
            false,
            Array.Empty<string>());
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

    private static MemberCompatibility GetCompatibility(
        Type sourceType,
        Type destinationType,
        ConventionMemberMappingDefinition? memberConfiguration)
    {
        if (memberConfiguration?.HasConverter == true)
            return MemberCompatibility.Success("Explicit converter configured.");

        if (destinationType.IsAssignableFrom(sourceType))
            return MemberCompatibility.Success("Matched by convention.");

        var sourceUnderlying = Nullable.GetUnderlyingType(sourceType);
        var destinationUnderlying = Nullable.GetUnderlyingType(destinationType);
        var normalizedSourceType = sourceUnderlying ?? sourceType;
        var normalizedDestinationType = destinationUnderlying ?? destinationType;

        if (destinationUnderlying is not null && destinationUnderlying == sourceType)
            return MemberCompatibility.Success("Mapped non-nullable source into nullable destination.");

        if (sourceUnderlying is not null && sourceUnderlying == destinationType)
        {
            return memberConfiguration?.HasNullSubstitute == true
                ? MemberCompatibility.Success("Nullable source mapped with null substitution.")
                : MemberCompatibility.Failure(
                    "AFC006",
                    MappingPlanFindingSeverity.Warning,
                    "Nullable source requires null substitution or an explicit converter for a non-nullable destination.",
                    (destination, source) => $"Destination member '{destination}' may receive null from source member '{source}'. Configure NullSubstitute or ConvertUsing.");
        }

        if (normalizedSourceType.IsEnum && destinationType == typeof(string))
            return MemberCompatibility.Success("Enum member converted to string by convention.", requiresEnumToString: true);

        if (normalizedSourceType.IsEnum && normalizedDestinationType.IsEnum)
        {
            var missingNames = Enum.GetNames(normalizedSourceType)
                .Where(name => !Enum.IsDefined(normalizedDestinationType, name))
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToArray();

            if (missingNames.Length == 0)
                return MemberCompatibility.Success("Enum member mapped by matching names.", requiresEnumToEnum: true);

            var missing = string.Join(", ", missingNames);
            return MemberCompatibility.Failure(
                "AFC008",
                MappingPlanFindingSeverity.Error,
                "Enum member names do not exist on the destination enum.",
                (destination, source) => $"Destination member '{destination}' cannot map source enum member '{source}' because destination enum is missing names: {missing}.");
        }

        if (IsNumeric(normalizedSourceType) && IsNumeric(normalizedDestinationType))
        {
            return MemberCompatibility.Failure(
                "AFC007",
                MappingPlanFindingSeverity.Warning,
                "Numeric conversion requires an explicit converter.",
                (destination, source) => $"Destination member '{destination}' requires numeric conversion from source member '{source}'. Configure ConvertUsing to make the conversion explicit.");
        }

        return MemberCompatibility.Failure(
            "AFC005",
            MappingPlanFindingSeverity.Error,
            "Source and destination member types are incompatible.",
            (destination, source) => $"Destination member '{destination}' cannot receive source member '{source}' because their types are incompatible.");
    }

    private static string GetDecisionText(
        ConventionMemberMappingDefinition? memberConfiguration,
        MemberCompatibility compatibility)
    {
        if (memberConfiguration?.HasConverter == true)
            return "Converted";

        if (memberConfiguration?.HasCondition == true)
            return "MappedWhen";

        if (compatibility.RequiresEnumToString)
            return "EnumToString";

        if (compatibility.RequiresEnumToEnum)
            return "EnumToEnum";

        if (memberConfiguration?.HasNullSubstitute == true)
            return "MappedWithNullSubstitute";

        return "Mapped";
    }

    private static string AddConfigurationReason(
        string reason,
        ConventionMemberMappingDefinition? memberConfiguration)
    {
        if (memberConfiguration is null)
            return reason;

        var parts = new List<string> { reason };
        if (memberConfiguration.IsRequired)
            parts.Add("Required destination member.");
        if (memberConfiguration.HasNullSubstitute)
            parts.Add("Null substitution configured.");
        if (memberConfiguration.HasConverter)
            parts.Add("Converter configured.");
        if (memberConfiguration.HasCondition)
            parts.Add("Condition configured.");

        return string.Join(" ", parts);
    }

    private static bool IsSensitive(string memberName, ConventionMappingOptions options)
    {
        var normalized = memberName.Replace("_", string.Empty).Replace("-", string.Empty);
        return options.SensitiveMemberNameFragments
            .Where(fragment => !string.IsNullOrWhiteSpace(fragment))
            .Any(fragment => normalized.IndexOf(fragment.Replace("_", string.Empty).Replace("-", string.Empty), StringComparison.OrdinalIgnoreCase) >= 0);
    }

    private static void AddRequiredFinding(List<MappingPlanFinding> findings, string memberName, string message)
    {
        findings.Add(new MappingPlanFinding(
            MappingPlanFindingSeverity.Error,
            "AFC009",
            memberName,
            message));
    }

    private static bool IsNumeric(Type type)
    {
        type = Nullable.GetUnderlyingType(type) ?? type;
        return type == typeof(byte) ||
            type == typeof(sbyte) ||
            type == typeof(short) ||
            type == typeof(ushort) ||
            type == typeof(int) ||
            type == typeof(uint) ||
            type == typeof(long) ||
            type == typeof(ulong) ||
            type == typeof(float) ||
            type == typeof(double) ||
            type == typeof(decimal);
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

    private sealed record SourceMemberResolution(
        string? SourceMemberName,
        Type? SourceMemberType,
        PropertyInfo? SourceProperty,
        Func<object, object?>? SourceValueFactory,
        bool IsAmbiguous,
        IReadOnlyCollection<string> CandidateNames)
    {
        public static SourceMemberResolution None { get; } = new(null, null, null, null, false, Array.Empty<string>());
    }

    private sealed record MemberCompatibility(
        bool CanMap,
        string Code,
        MappingPlanFindingSeverity Severity,
        string Reason,
        Func<string, string, string> Message,
        bool RequiresEnumToString,
        bool RequiresEnumToEnum)
    {
        public static MemberCompatibility Success(
            string reason,
            bool requiresEnumToString = false,
            bool requiresEnumToEnum = false)
        {
            return new(true, string.Empty, MappingPlanFindingSeverity.Info, reason, static (_, _) => string.Empty, requiresEnumToString, requiresEnumToEnum);
        }

        public static MemberCompatibility Failure(
            string code,
            MappingPlanFindingSeverity severity,
            string reason,
            Func<string, string, string> message)
        {
            return new(false, code, severity, reason, message, false, false);
        }
    }
}
