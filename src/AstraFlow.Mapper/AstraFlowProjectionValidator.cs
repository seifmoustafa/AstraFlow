using System.Linq.Expressions;

namespace AstraFlow.Mapper;

internal sealed class AstraFlowProjectionValidator : IProjectionValidator
{
    private readonly IProjectionRegistry _registry;

    public AstraFlowProjectionValidator(IProjectionRegistry registry)
    {
        _registry = registry;
    }

    public ProjectionValidationReport Validate(MappingOptions options)
    {
        if (options is null)
            throw new ArgumentNullException(nameof(options));

        if (options.ProjectionValidationMode == ProjectionValidationMode.Disabled)
            return new ProjectionValidationReport([]);

        var severity = options.ProjectionValidationMode;
        var findings = new List<ProjectionValidationFinding>();
        var registrations = _registry.Registrations;

        AddDuplicateFindings(findings, registrations, severity);
        AddExpressionFindings(findings, registrations, severity);

        return new ProjectionValidationReport(
            findings
                .OrderBy(finding => finding.Code, StringComparer.Ordinal)
                .ThenBy(finding => finding.SourceType?.FullName, StringComparer.Ordinal)
                .ThenBy(finding => finding.DestinationType?.FullName, StringComparer.Ordinal)
                .ThenBy(finding => finding.ProjectionName, StringComparer.OrdinalIgnoreCase)
                .ThenBy(finding => finding.ImplementationType?.FullName, StringComparer.Ordinal)
                .ToArray());
    }

    private static void AddDuplicateFindings(
        ICollection<ProjectionValidationFinding> findings,
        IReadOnlyCollection<ProjectionRegistration> registrations,
        ProjectionValidationMode severity)
    {
        foreach (var duplicate in registrations
                     .Where(registration => registration.Name is null)
                     .GroupBy(registration => new { registration.SourceType, registration.DestinationType })
                     .Where(group => group.Skip(1).Any()))
        {
            var implementations = JoinImplementations(duplicate);
            findings.Add(new ProjectionValidationFinding(
                severity,
                "AFP001",
                $"Multiple unnamed projections are registered for '{GetDisplayName(duplicate.Key.SourceType)} -> {GetDisplayName(duplicate.Key.DestinationType)}': {implementations}. Add unique projection names.",
                duplicate.Key.SourceType,
                duplicate.Key.DestinationType));
        }

        foreach (var duplicate in registrations
                     .Where(registration => registration.Name is not null)
                     .GroupBy(
                         registration => new NamedProjectionKey(
                             registration.SourceType,
                             registration.DestinationType,
                             registration.Name!.Trim().ToUpperInvariant()))
                     .Where(group => group.Skip(1).Any()))
        {
            var first = duplicate.First();
            var implementations = JoinImplementations(duplicate);
            findings.Add(new ProjectionValidationFinding(
                severity,
                "AFP002",
                $"Multiple projections named '{first.Name}' are registered for '{GetDisplayName(first.SourceType)} -> {GetDisplayName(first.DestinationType)}': {implementations}. Projection names must be unique per source/destination pair.",
                first.SourceType,
                first.DestinationType,
                first.Name));
        }

        foreach (var invalidName in registrations.Where(registration => registration.Name is not null && string.IsNullOrWhiteSpace(registration.Name)))
        {
            findings.Add(new ProjectionValidationFinding(
                severity,
                "AFP002",
                $"Projection '{GetDisplayName(invalidName.ImplementationType)}' has an empty projection name.",
                invalidName.SourceType,
                invalidName.DestinationType,
                invalidName.Name,
                invalidName.ImplementationType));
        }
    }

    private void AddExpressionFindings(
        ICollection<ProjectionValidationFinding> findings,
        IReadOnlyCollection<ProjectionRegistration> registrations,
        ProjectionValidationMode severity)
    {
        if (_registry is not AstraFlowProjectionRegistry registry)
            return;

        var entries = registry.GetEntries();
        foreach (var entry in entries)
        {
            var expression = entry.GetExpression();
            if (expression is null)
            {
                findings.Add(CreateFinding(
                    entry.Registration,
                    severity,
                    "AFP004",
                    $"Projection '{GetDisplayName(entry.Registration.ImplementationType)}' returned a null expression."));
                continue;
            }

            var visitor = new ProjectionRiskVisitor(entry.Registration, severity);
            visitor.Visit(expression);
            foreach (var finding in visitor.Findings)
            {
                findings.Add(finding);
            }
        }
    }

    private static ProjectionValidationFinding CreateFinding(
        ProjectionRegistration registration,
        ProjectionValidationMode severity,
        string code,
        string message)
    {
        return new ProjectionValidationFinding(
            severity,
            code,
            message,
            registration.SourceType,
            registration.DestinationType,
            registration.Name,
            registration.ImplementationType);
    }

    private static string JoinImplementations(IEnumerable<ProjectionRegistration> registrations)
    {
        return string.Join(
            ", ",
            registrations
                .Select(registration => GetDisplayName(registration.ImplementationType))
                .Distinct(StringComparer.Ordinal)
                .OrderBy(name => name, StringComparer.Ordinal));
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

    private sealed class ProjectionRiskVisitor : ExpressionVisitor
    {
        private readonly ProjectionRegistration _registration;
        private readonly ProjectionValidationMode _severity;
        private readonly HashSet<string> _codes = [];

        public ProjectionRiskVisitor(ProjectionRegistration registration, ProjectionValidationMode severity)
        {
            _registration = registration;
            _severity = severity;
        }

        public List<ProjectionValidationFinding> Findings { get; } = [];

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            if (typeof(IMapper).IsAssignableFrom(node.Method.DeclaringType))
            {
                Add("AFP101", $"Projection '{GetDisplayName(_registration.ImplementationType)}' calls '{nameof(IMapper)}.{node.Method.Name}' inside the expression. Use an explicit provider-translatable expression instead.");
            }
            else if (node.Method.DeclaringType == typeof(Guid) && node.Method.Name == nameof(Guid.NewGuid))
            {
                Add("AFP103", $"Projection '{GetDisplayName(_registration.ImplementationType)}' calls '{nameof(Guid.NewGuid)}', which is non-deterministic and usually not provider-translatable.");
            }
            else if (IsCustomMethod(node.Method.DeclaringType))
            {
                Add("AFP102", $"Projection '{GetDisplayName(_registration.ImplementationType)}' calls custom method '{GetDisplayName(node.Method.DeclaringType!)}.{node.Method.Name}', which query providers may not translate.");
            }

            return base.VisitMethodCall(node);
        }

        protected override Expression VisitMember(MemberExpression node)
        {
            if ((node.Member.DeclaringType == typeof(DateTime) || node.Member.DeclaringType == typeof(DateTimeOffset)) &&
                (node.Member.Name is nameof(DateTime.Now) or nameof(DateTime.UtcNow)))
            {
                Add("AFP103", $"Projection '{GetDisplayName(_registration.ImplementationType)}' reads '{GetDisplayName(node.Member.DeclaringType!)}.{node.Member.Name}', which is non-deterministic and usually not provider-translatable.");
            }

            if (node.Expression is ConstantExpression constant &&
                IsCompilerGeneratedClosure(constant.Type) &&
                !IsSimpleValue(node.Type))
            {
                Add("AFP104", $"Projection '{GetDisplayName(_registration.ImplementationType)}' captures complex closure value '{node.Member.Name}'. Capture scalar values only or pass provider-translatable constants.");
            }

            return base.VisitMember(node);
        }

        protected override Expression VisitNew(NewExpression node)
        {
            if (node.Type.IsAbstract || node.Type.IsInterface)
            {
                Add("AFP105", $"Projection '{GetDisplayName(_registration.ImplementationType)}' constructs unsupported type '{GetDisplayName(node.Type)}'.");
            }

            return base.VisitNew(node);
        }

        private void Add(string code, string message)
        {
            if (!_codes.Add(code))
                return;

            Findings.Add(CreateFinding(_registration, _severity, code, message));
        }

        private static bool IsCustomMethod(Type? declaringType)
        {
            if (declaringType is null)
                return false;

            if (declaringType == typeof(string) ||
                declaringType == typeof(Math) ||
                declaringType == typeof(decimal) ||
                declaringType == typeof(Guid) ||
                declaringType == typeof(DateTime) ||
                declaringType == typeof(DateTimeOffset) ||
                declaringType.Namespace?.StartsWith("System", StringComparison.Ordinal) == true)
            {
                return false;
            }

            return true;
        }

        private static bool IsCompilerGeneratedClosure(Type type)
        {
            return type.Name.Contains("DisplayClass", StringComparison.Ordinal) ||
                type.Name.Contains("<>", StringComparison.Ordinal);
        }

        private static bool IsSimpleValue(Type type)
        {
            type = Nullable.GetUnderlyingType(type) ?? type;

            return type.IsPrimitive ||
                type.IsEnum ||
                type == typeof(string) ||
                type == typeof(decimal) ||
                type == typeof(Guid) ||
                type == typeof(DateTime) ||
                type == typeof(DateTimeOffset);
        }
    }

    private sealed record NamedProjectionKey(Type SourceType, Type DestinationType, string Name);
}
