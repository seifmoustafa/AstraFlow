using System.Linq.Expressions;
using System.Reflection;

namespace AstraFlow.Mapper;

internal sealed class AstraFlowProjectionPlanProvider : IProjectionPlanProvider
{
    private readonly IProjectionRegistry _registry;
    private readonly IProjectionValidator _validator;

    public AstraFlowProjectionPlanProvider(IProjectionRegistry registry, IProjectionValidator validator)
    {
        _registry = registry;
        _validator = validator;
    }

    public IReadOnlyCollection<ProjectionPlan> GetProjectionPlans()
    {
        if (_registry is not AstraFlowProjectionRegistry registry)
            return Array.Empty<ProjectionPlan>();

        var validation = _validator.Validate(new MappingOptions { ProjectionValidationMode = ProjectionValidationMode.Warning });
        return registry.GetEntries()
            .Select(entry => CreatePlan(entry, validation.Findings))
            .OrderBy(plan => plan.SourceType, StringComparer.Ordinal)
            .ThenBy(plan => plan.DestinationType, StringComparer.Ordinal)
            .ThenBy(plan => plan.ProjectionName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(plan => plan.ParameterType, StringComparer.Ordinal)
            .ThenBy(plan => plan.ImplementationType, StringComparer.Ordinal)
            .ToArray();
    }

    private static ProjectionPlan CreatePlan(
        AstraFlowProjectionRegistry.ProjectionEntry entry,
        IReadOnlyCollection<ProjectionValidationFinding> validationFindings)
    {
        var expression = entry.GetExpression();
        var members = expression is null
            ? Array.Empty<ProjectionPlanMember>()
            : ProjectionPlanExpressionReader.ReadMembers(expression);

        var findings = validationFindings
            .Where(finding =>
                finding.SourceType == entry.Registration.SourceType &&
                finding.DestinationType == entry.Registration.DestinationType &&
                string.Equals(finding.ProjectionName, entry.Registration.Name, StringComparison.OrdinalIgnoreCase) &&
                finding.ImplementationType == entry.Registration.ImplementationType)
            .Select(finding => new ProjectionPlanFinding(
                finding.Severity == ProjectionValidationMode.Error
                    ? MappingPlanFindingSeverity.Error
                    : MappingPlanFindingSeverity.Warning,
                finding.Code,
                null,
                finding.Message))
            .OrderBy(finding => finding.Code, StringComparer.Ordinal)
            .ThenBy(finding => finding.Message, StringComparer.Ordinal)
            .ToArray();

        return new ProjectionPlan(
            GetDisplayName(entry.Registration.SourceType),
            GetDisplayName(entry.Registration.DestinationType),
            entry.Registration.Name,
            GetDisplayName(entry.Registration.ImplementationType),
            entry.Registration.ParameterType is null ? null : GetDisplayName(entry.Registration.ParameterType),
            ReadParameters(entry.Registration.ParameterType),
            members,
            findings);
    }

    private static IReadOnlyList<ProjectionParameterMember> ReadParameters(Type? parameterType)
    {
        if (parameterType is null)
            return Array.Empty<ProjectionParameterMember>();

        return parameterType
            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
            .Where(property => property.GetIndexParameters().Length == 0)
            .OrderBy(property => property.Name, StringComparer.Ordinal)
            .Select(property => new ProjectionParameterMember(
                property.Name,
                GetDisplayName(property.PropertyType),
                IsSensitiveName(property.Name)))
            .ToArray();
    }

    private static bool IsSensitiveName(string name)
    {
        return name.Contains("password", StringComparison.OrdinalIgnoreCase) ||
            name.Contains("secret", StringComparison.OrdinalIgnoreCase) ||
            name.Contains("token", StringComparison.OrdinalIgnoreCase) ||
            name.Contains("key", StringComparison.OrdinalIgnoreCase);
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

    private sealed class ProjectionPlanExpressionReader : ExpressionVisitor
    {
        private readonly List<ProjectionPlanMember> _members = [];

        public static IReadOnlyList<ProjectionPlanMember> ReadMembers(LambdaExpression expression)
        {
            var reader = new ProjectionPlanExpressionReader(expression.Parameters.Count > 1 ? expression.Parameters[1] : null);
            reader.Visit(expression.Body);
            return reader._members
                .OrderBy(member => member.DestinationMember, StringComparer.Ordinal)
                .ThenBy(member => member.Decision, StringComparer.Ordinal)
                .ToArray();
        }

        private readonly ParameterExpression? _projectionParameter;

        private ProjectionPlanExpressionReader(ParameterExpression? projectionParameter)
        {
            _projectionParameter = projectionParameter;
        }

        protected override Expression VisitMemberInit(MemberInitExpression node)
        {
            foreach (var binding in node.Bindings.OfType<MemberAssignment>())
            {
                _members.Add(new ProjectionPlanMember(
                    binding.Member.Name,
                    Summarize(binding.Expression),
                    ContainsParameter(binding.Expression, _projectionParameter) ? "Parameterized" : "Assigned",
                    "Destination member is assigned by the projection expression."));
            }

            return base.VisitMemberInit(node);
        }

        protected override Expression VisitNew(NewExpression node)
        {
            for (var i = 0; i < node.Arguments.Count; i++)
            {
                var name = node.Members?.Count > i
                    ? node.Members[i].Name
                    : node.Constructor?.GetParameters()[i].Name ?? $"arg{i}";
                var argument = node.Arguments[i];
                _members.Add(new ProjectionPlanMember(
                    name,
                    Summarize(argument),
                    ContainsParameter(argument, _projectionParameter) ? "Parameterized" : "Constructed",
                    "Destination constructor argument is supplied by the projection expression."));
            }

            return base.VisitNew(node);
        }

        private static bool ContainsParameter(Expression expression, ParameterExpression? projectionParameter)
        {
            if (projectionParameter is null)
                return false;

            var visitor = new ParameterUseVisitor(projectionParameter);
            visitor.Visit(expression);
            return visitor.UsesProjectionParameter;
        }

        private static string Summarize(Expression expression)
        {
            return expression switch
            {
                MemberExpression member => member.Member.Name,
                MethodCallExpression call => call.Method.Name + "()",
                ConstantExpression => "constant",
                ParameterExpression parameter => parameter.Name ?? "parameter",
                BinaryExpression binary => binary.NodeType.ToString(),
                UnaryExpression unary => unary.NodeType.ToString(),
                _ => expression.NodeType.ToString()
            };
        }
    }

    private sealed class ParameterUseVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _projectionParameter;

        public ParameterUseVisitor(ParameterExpression projectionParameter)
        {
            _projectionParameter = projectionParameter;
        }

        public bool UsesProjectionParameter { get; private set; }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            if (node == _projectionParameter)
                UsesProjectionParameter = true;

            return base.VisitParameter(node);
        }
    }
}
