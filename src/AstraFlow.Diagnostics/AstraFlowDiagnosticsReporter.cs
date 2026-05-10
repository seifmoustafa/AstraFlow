using System.Reflection;
using System.Text;
using System.Text.Json;
using AstraFlow.Mapper;
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AstraFlow.Diagnostics;

internal sealed class AstraFlowDiagnosticsReporter : IAstraFlowDiagnosticsReporter
{
    private readonly AstraFlowDiagnosticsSnapshot _snapshot;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly AstraFlowDiagnosticsOptions _options;

    public AstraFlowDiagnosticsReporter(
        AstraFlowDiagnosticsSnapshot snapshot,
        IServiceScopeFactory scopeFactory,
        AstraFlowDiagnosticsOptions options)
    {
        _snapshot = snapshot;
        _scopeFactory = scopeFactory;
        _options = options;
    }

    /// <inheritdoc />
    public AstraFlowDiagnosticReport CreateReport()
    {
        var descriptors = _snapshot.Descriptors;
        var requestHandlers = GetRegistrations(descriptors, "Request handler", typeof(IRequestHandler<,>));
        var notificationHandlers = GetRegistrations(descriptors, "Notification handler", typeof(INotificationHandler<>));
        var pipelineBehaviors = GetRegistrations(descriptors, "Pipeline behavior", typeof(IPipelineBehavior<,>));
        var mappingRules = GetRegistrations(descriptors, "Mapping rule", typeof(IObjectMappingRule));
        var projections = GetRegistrations(descriptors, "Projection", typeof(IProjection<,>));

        var findings = new List<AstraFlowDiagnosticFinding>();
        AddInfoFindings(findings, requestHandlers, notificationHandlers, pipelineBehaviors, mappingRules, projections);
        AddDuplicateRequestHandlerFindings(findings, descriptors);
        AddUnsafeLifetimeFindings(findings, requestHandlers, notificationHandlers, pipelineBehaviors, mappingRules);

        if (_options.ValidateRequestCoverage)
            AddRequestCoverageFindings(findings, descriptors);

        if (_options.ValidateMappingCatalog)
            AddMappingValidationFindings(findings);

        var orderedFindings = findings
            .OrderByDescending(f => f.Severity)
            .ThenBy(f => f.Code, StringComparer.Ordinal)
            .ThenBy(f => f.Subject, StringComparer.Ordinal)
            .ThenBy(f => f.Message, StringComparer.Ordinal)
            .ToArray();

        var summary = new AstraFlowDiagnosticsSummary(
            requestHandlers.Count,
            notificationHandlers.Count,
            pipelineBehaviors.Count,
            mappingRules.Count,
            projections.Count,
            orderedFindings.Count(f => f.Severity == DiagnosticSeverity.Info),
            orderedFindings.Count(f => f.Severity == DiagnosticSeverity.Warning),
            orderedFindings.Count(f => f.Severity == DiagnosticSeverity.Error),
            orderedFindings.Count(f => f.Severity == DiagnosticSeverity.Fatal));

        return new AstraFlowDiagnosticReport(
            requestHandlers,
            notificationHandlers,
            pipelineBehaviors,
            mappingRules,
            projections,
            orderedFindings,
            summary);
    }

    /// <inheritdoc />
    public string CreateJsonReport(JsonSerializerOptions? jsonOptions = null)
    {
        return JsonSerializer.Serialize(
            CreateReport(),
            jsonOptions ?? new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
    }

    /// <inheritdoc />
    public string CreateMarkdownReport()
    {
        var report = CreateReport();
        var builder = new StringBuilder();

        builder.AppendLine("# AstraFlow Diagnostics Report");
        builder.AppendLine();
        builder.AppendLine("## Summary");
        builder.AppendLine();
        builder.AppendLine("| Metric | Count |");
        builder.AppendLine("| --- | ---: |");
        builder.AppendLine($"| Request handlers | {report.Summary.RequestHandlerCount} |");
        builder.AppendLine($"| Notification handlers | {report.Summary.NotificationHandlerCount} |");
        builder.AppendLine($"| Pipeline behaviors | {report.Summary.PipelineBehaviorCount} |");
        builder.AppendLine($"| Mapping rules | {report.Summary.MappingRuleCount} |");
        builder.AppendLine($"| Projections | {report.Summary.ProjectionCount} |");
        builder.AppendLine($"| Info findings | {report.Summary.InfoCount} |");
        builder.AppendLine($"| Warning findings | {report.Summary.WarningCount} |");
        builder.AppendLine($"| Error findings | {report.Summary.ErrorCount} |");
        builder.AppendLine($"| Fatal findings | {report.Summary.FatalCount} |");
        builder.AppendLine();

        AppendFindings(builder, report.Findings);
        AppendRegistrations(builder, "Request Handlers", report.RequestHandlers);
        AppendRegistrations(builder, "Notification Handlers", report.NotificationHandlers);
        AppendRegistrations(builder, "Pipeline Behaviors", report.PipelineBehaviors);
        AppendRegistrations(builder, "Mapping Rules", report.MappingRules);
        AppendRegistrations(builder, "Projections", report.Projections);

        return builder.ToString();
    }

    private static IReadOnlyList<AstraFlowDiagnosticRegistration> GetRegistrations(
        IEnumerable<ServiceDescriptor> descriptors,
        string category,
        Type openServiceType)
    {
        return descriptors
            .Where(d => IsServiceMatch(d.ServiceType, openServiceType))
            .Select(d => new AstraFlowDiagnosticRegistration(
                category,
                GetDisplayName(d.ServiceType),
                GetImplementationType(d) is { } implementationType ? GetDisplayName(implementationType) : null,
                d.Lifetime))
            .OrderBy(r => r.ServiceType, StringComparer.Ordinal)
            .ThenBy(r => r.ImplementationType, StringComparer.Ordinal)
            .ThenBy(r => r.Lifetime)
            .ToArray();
    }

    private void AddInfoFindings(
        ICollection<AstraFlowDiagnosticFinding> findings,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> requestHandlers,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> notificationHandlers,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> pipelineBehaviors,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> mappingRules,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> projections)
    {
        if (!_options.IncludeInfoFindings)
            return;

        findings.Add(new AstraFlowDiagnosticFinding(
            DiagnosticSeverity.Info,
            "AFD000",
            $"Discovered {requestHandlers.Count} request handlers, {notificationHandlers.Count} notification handlers, {pipelineBehaviors.Count} pipeline behaviors, {mappingRules.Count} mapping rules, and {projections.Count} projections."));
    }

    private static void AddDuplicateRequestHandlerFindings(
        ICollection<AstraFlowDiagnosticFinding> findings,
        IEnumerable<ServiceDescriptor> descriptors)
    {
        var duplicates = descriptors
            .Where(d => IsServiceMatch(d.ServiceType, typeof(IRequestHandler<,>)))
            .GroupBy(d => d.ServiceType)
            .Where(g => g.Select(GetImplementationType).Where(t => t is not null).Distinct().Skip(1).Any())
            .ToArray();

        foreach (var duplicate in duplicates)
        {
            var implementations = string.Join(
                ", ",
                duplicate
                    .Select(GetImplementationType)
                    .Where(t => t is not null)
                    .Distinct()
                    .Select(t => GetDisplayName(t!))
                    .OrderBy(name => name, StringComparer.Ordinal));

            findings.Add(new AstraFlowDiagnosticFinding(
                DiagnosticSeverity.Error,
                "AFD101",
                $"Multiple request handlers are registered for {GetDisplayName(duplicate.Key)}: {implementations}.",
                GetDisplayName(duplicate.Key)));
        }
    }

    private static void AddUnsafeLifetimeFindings(
        ICollection<AstraFlowDiagnosticFinding> findings,
        params IReadOnlyCollection<AstraFlowDiagnosticRegistration>[] registrationGroups)
    {
        foreach (var registration in registrationGroups.SelectMany(g => g))
        {
            if (registration.Lifetime != ServiceLifetime.Singleton)
                continue;

            findings.Add(new AstraFlowDiagnosticFinding(
                DiagnosticSeverity.Warning,
                "AFD201",
                $"{registration.Category} {registration.ImplementationType ?? registration.ServiceType} is registered as singleton. Scoped lifetime is the recommended default for AstraFlow handlers, behaviors, and mapping rules.",
                registration.ImplementationType ?? registration.ServiceType));
        }
    }

    private void AddRequestCoverageFindings(
        ICollection<AstraFlowDiagnosticFinding> findings,
        IReadOnlyCollection<ServiceDescriptor> descriptors)
    {
        var handlerServiceTypes = descriptors
            .Where(d => IsServiceMatch(d.ServiceType, typeof(IRequestHandler<,>)))
            .Select(d => d.ServiceType)
            .ToHashSet();

        var assemblies = GetDiagnosticAssemblies(descriptors);
        var requestTypes = assemblies
            .SelectMany(GetLoadableTypes)
            .Where(t => t is { IsAbstract: false, IsInterface: false, ContainsGenericParameters: false })
            .Select(t => new
            {
                RequestType = t,
                RequestInterfaces = t.GetInterfaces()
                    .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>))
                    .Distinct()
                    .ToArray()
            })
            .Where(r => r.RequestInterfaces.Length != 0)
            .OrderBy(r => r.RequestType.FullName, StringComparer.Ordinal)
            .ToArray();

        foreach (var request in requestTypes.Where(r => r.RequestInterfaces.Length > 1))
        {
            var contracts = string.Join(", ", request.RequestInterfaces.Select(GetDisplayName).Order(StringComparer.Ordinal));
            findings.Add(new AstraFlowDiagnosticFinding(
                DiagnosticSeverity.Error,
                "AFD102",
                $"{GetDisplayName(request.RequestType)} implements multiple request contracts: {contracts}.",
                GetDisplayName(request.RequestType)));
        }

        foreach (var request in requestTypes.Where(r => r.RequestInterfaces.Length == 1))
        {
            var responseType = request.RequestInterfaces[0].GetGenericArguments()[0];
            var handlerType = typeof(IRequestHandler<,>).MakeGenericType(request.RequestType, responseType);

            if (handlerServiceTypes.Contains(handlerType))
                continue;

            findings.Add(new AstraFlowDiagnosticFinding(
                DiagnosticSeverity.Error,
                "AFD103",
                $"No request handler is registered for {GetDisplayName(request.RequestType)} returning {GetDisplayName(responseType)}.",
                GetDisplayName(request.RequestType)));
        }
    }

    private void AddMappingValidationFindings(ICollection<AstraFlowDiagnosticFinding> findings)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var validator = scope.ServiceProvider.GetService<IObjectMappingValidator>();
            if (validator is null)
                return;

            var options = scope.ServiceProvider.GetService<IOptions<MappingOptions>>()?.Value
                ?? new MappingOptions();
            validator.Validate(options);
        }
        catch (Exception ex)
        {
            findings.Add(new AstraFlowDiagnosticFinding(
                DiagnosticSeverity.Error,
                "AFD301",
                $"Mapper catalog validation failed: {ex.Message}",
                ex.GetType().FullName));
        }
    }

    private IReadOnlyCollection<Assembly> GetDiagnosticAssemblies(IEnumerable<ServiceDescriptor> descriptors)
    {
        return _options.AssemblyMarkerTypes
            .Where(t => t is not null)
            .Select(t => t.Assembly)
            .Concat(descriptors.Select(GetImplementationType).Where(t => t is not null).Select(t => t!.Assembly))
            .Distinct()
            .OrderBy(a => a.FullName, StringComparer.Ordinal)
            .ToArray();
    }

    private static IEnumerable<Type> GetLoadableTypes(Assembly assembly)
    {
        try
        {
            return assembly.GetTypes();
        }
        catch (ReflectionTypeLoadException ex)
        {
            return ex.Types.Where(type => type is not null)!;
        }
    }

    private static bool IsServiceMatch(Type serviceType, Type openServiceType)
    {
        if (serviceType == openServiceType)
            return true;

        if (serviceType.IsGenericTypeDefinition)
            return serviceType == openServiceType;

        return serviceType.IsGenericType && serviceType.GetGenericTypeDefinition() == openServiceType;
    }

    private static Type? GetImplementationType(ServiceDescriptor descriptor)
    {
        if (descriptor.ImplementationType is not null)
            return descriptor.ImplementationType;

        return descriptor.ImplementationInstance?.GetType();
    }

    private static string GetDisplayName(Type type)
    {
        if (!type.IsGenericType)
            return type.FullName ?? type.Name;

        var genericName = type.GetGenericTypeDefinition().FullName ?? type.Name;
        var tickIndex = genericName.IndexOf('`', StringComparison.Ordinal);
        if (tickIndex >= 0)
            genericName = genericName[..tickIndex];

        var arguments = string.Join(", ", type.GetGenericArguments().Select(GetDisplayName));
        return $"{genericName}<{arguments}>";
    }

    private static void AppendFindings(
        StringBuilder builder,
        IReadOnlyCollection<AstraFlowDiagnosticFinding> findings)
    {
        builder.AppendLine("## Findings");
        builder.AppendLine();

        if (findings.Count == 0)
        {
            builder.AppendLine("No findings.");
            builder.AppendLine();
            return;
        }

        builder.AppendLine("| Severity | Code | Subject | Message |");
        builder.AppendLine("| --- | --- | --- | --- |");
        foreach (var finding in findings)
        {
            builder.AppendLine($"| {finding.Severity} | {finding.Code} | {EscapeMarkdown(finding.Subject)} | {EscapeMarkdown(finding.Message)} |");
        }

        builder.AppendLine();
    }

    private static void AppendRegistrations(
        StringBuilder builder,
        string title,
        IReadOnlyCollection<AstraFlowDiagnosticRegistration> registrations)
    {
        builder.AppendLine($"## {title}");
        builder.AppendLine();

        if (registrations.Count == 0)
        {
            builder.AppendLine("None discovered.");
            builder.AppendLine();
            return;
        }

        builder.AppendLine("| Service | Implementation | Lifetime |");
        builder.AppendLine("| --- | --- | --- |");
        foreach (var registration in registrations)
        {
            builder.AppendLine($"| {EscapeMarkdown(registration.ServiceType)} | {EscapeMarkdown(registration.ImplementationType)} | {registration.Lifetime} |");
        }

        builder.AppendLine();
    }

    private static string EscapeMarkdown(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? ""
            : value.Replace("|", "\\|", StringComparison.Ordinal);
    }
}
