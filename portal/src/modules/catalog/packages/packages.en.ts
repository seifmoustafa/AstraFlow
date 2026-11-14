export const packagesEn = {
  seo: {
    title: 'Packages',
    description:
      'Discover AstraFlow .NET packages, verify target frameworks and NuGet availability, and assemble an install plan.',
  },
  workspace: {
    heroEyebrow: 'A DIFFERENT WAY TO COMPOSE',
    heroTitleLead: 'Take the parts.',
    heroTitleAccent: 'Keep the control.',
    heroLead:
      'A family of {count} focused .NET packages. Choose a capability, see what it adds, and generate an install plan without adopting a platform.',
    buildStack: 'Build your stack',
    browsePackages: 'Browse packages',
    assemblyEyebrow: '01 / THE ASSEMBLY BENCH',
    assemblyTitleLead: 'Compose only what',
    assemblyTitleAccent: 'your application needs.',
    assemblyCaptionLead: 'All {count} AstraFlow packages resolved with target frameworks, transitive references, and explicit',
    assemblyCaptionTail: 'build rules.',
    directoryEyebrow: '02 / COMPLETE PACKAGE DIRECTORY',
    directoryTitleLead: 'Specific tools.',
    directoryTitleAccent: 'Clear boundaries.',
    directoryCaption:
      'All {count} AstraFlow packages organized by architecture layer, target frameworks, and integration boundary.',
  },
  directory: {
    filterByLayer: 'Filter package directory by layer',
    all: 'All ({count})',
    filterLabel: 'Filter package directory',
    filterPlaceholder: 'Filter packages (e.g. Mapper, CLI, net10.0)...',
    documentation: 'Documentation',
    stageInStack: '+ Stage in stack',
    noMatches: 'No packages match “{query}” in this layer.',
  },
  composer: {
    ariaLabel: 'AstraFlow Stack Composer',
    kicker: 'INTERACTIVE STACK COMPOSER · VERIFIED {version} MANIFEST',
    packageCount: '{count} packages',
    directCount: '{count} direct',
    effectiveCount: '{count} effective',
    stagedLabel: 'Staged {label}',
    stagedPackages: 'Staged {packages}',
    presetActive: 'Preset active: {label}',
    minimal: 'Minimal',
    allCore: 'All Core',
    reset: 'Reset',
    minimalPreset: 'Minimal Mediator',
    allCorePreset: 'All Core',
    clearedPreset: 'Cleared',
    presets: 'Quick Architecture Presets',
    presetsAriaLabel: 'Quick architecture presets',
    searchAriaLabel: 'Filter {count} AstraFlow packages',
    searchPlaceholder: 'Search packages by name or capability...',
    filterByLayer: 'Filter selector by architecture layer',
    all: 'All ({count})',
    packageUnit: 'packages',
    packageUnitSingular: 'package',
    impliedReference: 'Implied ref',
    selected: 'Selected',
    readDocumentation: 'Read documentation for {packageId}',
    documentationTitle: 'Documentation for {packageId}',
    noMatches: 'No packages match “{query}”.',
    noPackagesStaged: 'No packages staged',
    toolsOnlyFrameworks: 'Compiler / Tool assets only (no runtime TFM lock)',
    stackTitle: 'LIVING ISOMETRIC STACK',
    installPlan: 'INSTALL PLAN',
    installPlanFormats: 'Install plan output formats',
    transitiveReferences: 'Transitive project references included:',
    outputFormatCli: '.NET CLI',
    outputFormatXml: 'PackageReference XML',
    outputFormatTool: '.NET Tool',
    outputFormatCombined: 'Combined',
    legendRuntime: 'Runtime',
    legendImpliedReference: 'Implied ref',
    legendCompilerAsset: 'Compiler asset',
    selectPackageToBuildStack: 'SELECT A PACKAGE TO BUILD STACK',
    emptyStackComment: '# Select one or more packages or choose an architecture preset.',
    toolInstallTabComment: '# AstraFlow.Cli installs via the .NET Tool CLI tab:',
    emptyNuGetSelectionComment: '# Select one or more NuGet packages.',
    toolInstallPromptComment:
      '# Select AstraFlow.Cli under Build-Time & Tooling to generate:\n# dotnet tool install --global AstraFlow.Cli --version {version}',
    stackWarnings: {
      overlapTitle: 'Convenience meta-package overlap',
      overlapMessage:
        '{metaPackageId} already includes {includedPackageIds} transitively. Keep only {metaPackageId} for the combined stack, or select focused packages without the meta-package.',
      privateAssetsTitle: 'PrivateAssets="all" required',
      privateAssetsMessage:
        '{packageIds} ship compiler assets. Keep PrivateAssets="all" on their PackageReference so those assets do not flow transitively.',
      generatorPairingTitle: 'Pair related packages',
      generatorPairingMessage:
        '{packageId} is designed for projects using {requiredPackageIds}.',
      toolInstallTitle: 'Install .NET tools separately',
      toolInstallMessage:
        '{packageIds} {count, plural, one {is} other {are}} installed with dotnet tool install, separately from application PackageReference entries.',
      testProjectBoundaryTitle: 'Separate test-project references',
      testProjectBoundaryMessage:
        'Add test support packages to test projects, separate from production runtime project files.',
      conventionsOptInTitle: 'Opt-in package boundary',
      conventionsOptInMessage:
        '{packageIds} require explicit registration and are not enabled implicitly.',
      hostFrameworkRequirementTitle: 'Host framework requirements',
      hostFrameworkRequirementMessage:
        '{count, plural, one {The selected integration requires {frameworkNames}.} other {The selected integrations require {frameworkNames}.}}',
    },
    packagesSelected: '{count} packages selected',
    sharedFrameworks: 'Shared TFMs:',
    copied: 'Copied ✓',
    copyOutput: 'Copy output',
    copiedStatus: 'Copied current install output to clipboard.',
    openPackageDocs: 'Open {packageName} docs',
    allPackagesDirectory: 'All {count} AstraFlow packages directory',
    stackVisualization: 'Isometric stack visualization showing {count} effective packages',
  },
  layers: {
    core: 'Core',
    mapping: 'Mapping & EF',
    'diagnostics-security': 'Diagnostics & Security',
    testing: 'Testing & Quality',
    tooling: 'Build-Time & Tooling',
    integrations: 'Framework Integrations',
  },
  releaseLabels: {
    planned: 'Planned · {version}',
    tool: '{version} · .NET Tool',
    privateAssets: '{version} · PrivateAssets="all"',
    published: '{version} · Published',
  },
  loom: {
    ariaLabel: 'AstraFlow interactive isometric module loom',
    chassisAriaLabel:
      'Interactive isometric capability modules docked onto the AstraFlow.Contracts chassis',
    modulesAriaLabel: 'AstraFlow capability modules',
    owningPackages: 'Owning packages',
    title: 'ISOMETRIC MODULE LOOM · CONTRACTS CHASSIS',
    liveStatus: '6 CAPABILITY PLANES · LIVE',
    foundationLabel: 'ASTRAFLOW.CONTRACTS · SHARED FOUNDATION',
    publishedStatus: 'Published · {version} NuGet',
    publishedToolingStatus: 'Published · {version} (PrivateAssets + .NET Tool)',
    plannedStatus: '{packageName} planned {version}',
    publishedPackageStatus: '{packageName} {version}',
    frameworksLabel: 'TFM: {frameworks}',
    privateAssetsSuffix: ' · PrivateAssets="all"',
    toolSuffix: ' · .NET Tool',
    modules: {
      contracts: { shortLabel: 'Contracts', plateTitle: 'CONTRACTS', name: 'AstraFlow.Contracts Chassis', summary: 'Framework-neutral request, notification, stream, and pipeline abstractions with zero mediator runtime coupling.', docLabel: 'Contracts boundary docs' },
      tooling: { shortLabel: 'Generators & CLI', plateTitle: 'GEN + CLI', name: 'Generators, Analyzers & CLI', summary: 'Compile-time Roslyn diagnostics and opt-in [AstraGenerateMapping] source generators (PrivateAssets="all") plus the global `astraflow` CLI tool.', docLabel: 'Generators & CLI docs' },
      testing: { shortLabel: 'Testing', plateTitle: 'TESTING', name: 'Testing Harnesses & Assertions', summary: 'Runner-neutral FakeMediator, pipeline harnesses, and the AstraFlow.Assertions Should() API.', docLabel: 'Testing guide' },
      diagnostics: { shortLabel: 'Diagnostics', plateTitle: 'DIAGNOSTICS', name: 'Diagnostics, Security & Telemetry', summary: 'Deterministic registration snapshots, startup validation findings, shared sensitive-name redaction rules, and payload-free OpenTelemetry spans.', docLabel: 'Diagnostics & security' },
      mediator: { shortLabel: 'Mediator', plateTitle: 'MEDIATOR', name: 'Mediator & Request Pipelines', summary: 'Explicit single-handler dispatch, async streams, sequential/parallel notifications, pre/post processors, and pipeline behaviors.', docLabel: 'Mediator guide' },
      mapper: { shortLabel: 'Mapper', plateTitle: 'MAPPER', name: 'Explicit Mapper & Projections', summary: 'Declared IDeclaredObjectMappingRule pairs, named/parameterized IProjection expressions, opt-in conventions, and EF Core relational checks.', docLabel: 'Mapper & projections' },
    },
  },
  targetSummary: {
    runtime: '{frameworks}',
    compiler: '{frameworks} (analyzers/dotnet/cs compiler asset)',
    tool: '{frameworks} (.NET global/local tool)',
  },
  packageProfiles: {
    AstraFlow: {
      shortName: 'Convenience',
      categoryLabel: 'Meta-package',
      roleSummary:
        'Convenience umbrella entry combining AstraFlow.Contracts, AstraFlow.Mediator, and AstraFlow.Mapper via AddAstraFlow(...).',
      capabilities: [
        'Single PackageReference for apps using both mediator and explicit mapper',
        'Registers mediator and mapper via AddAstraFlow(...) without enabling conventions',
        'Keeps optional EF Core, ASP.NET Core, FluentValidation, and OpenTelemetry separate',
      ],
    },
    'AstraFlow.Contracts': {
      shortName: 'Contracts',
      categoryLabel: 'Mediator Core',
      roleSummary:
        'Framework-neutral mediator contracts (IRequest, IStreamRequest, INotification, ISender, IPublisher, pipelines) for shared assemblies.',
      capabilities: [
        'Zero runtime mediator implementation coupling in domain/contract assemblies',
        'Keeps AstraFlow.Mediator namespace for seamless source compatibility',
        'Supports netstandard2.0, net8.0, net9.0, and net10.0',
      ],
    },
    'AstraFlow.Mediator': {
      shortName: 'Mediator',
      categoryLabel: 'Mediator Core',
      roleSummary:
        'Explicit request, void command, async stream, notification, pipeline behavior, pre/post processor, and exception-flow dispatch.',
      capabilities: [
        'Resolves exactly one handler per request; fails explicitly on missing or duplicate handlers',
        'Sequential, Parallel, and BoundedParallel notification strategies',
        'Request pre/post processors and explicit exception actions/handlers',
      ],
    },
    'AstraFlow.Mapper': {
      shortName: 'Mapper',
      categoryLabel: 'Mapping Core',
      roleSummary:
        'Explicit object mapping rules (IDeclaredObjectMappingRule), startup catalog validation, named/parameterized projections, and secure ID abstractions.',
      capabilities: [
        'Explicit declared mapping pairs validated at startup',
        'Named and parameterized IProjection expressions with AFP diagnostics',
        'ISecureIdCodec and SecureIdMapper without coupling encryption keys',
      ],
    },
    'AstraFlow.Mapper.Conventions': {
      shortName: 'Conventions',
      categoryLabel: 'Mapping Extension',
      roleSummary:
        'Opt-in pair-by-pair convention mapping with deterministic mapping plans, constructor/record binding, and deny-by-default sensitive-member blocks.',
      capabilities: [
        'Never enabled implicitly; requires explicit pair/profile registration',
        'Produces deterministic IMappingPlanProvider inspection records',
        'Uses AstraFlow.Security sensitive-name taxonomy to block secret fields',
      ],
    },
    'AstraFlow.Mapper.EntityFrameworkCore': {
      shortName: 'EF Core',
      categoryLabel: 'Mapping Integration',
      roleSummary:
        'Optional EF Core relational projection translation checks and parameterized validation targeting net10.0.',
      capabilities: [
        'Validates registered IProjection queries against EF Core relational model translation',
        'Detects unmapped entity sources and verifies parameterized projection samples at startup',
        'Keeps EF Core dependencies strictly out of AstraFlow.Mapper',
      ],
    },
    'AstraFlow.Diagnostics': {
      shortName: 'Diagnostics',
      categoryLabel: 'Inspection',
      roleSummary:
        'Framework-neutral registration snapshots, severity-coded findings, JSON/Markdown reports, and health summaries.',
      capabilities: [
        'Preserves DI registration order for behaviors, processors, and exception handlers',
        'Generates deterministic JSON and Markdown reports without inspecting payload values',
        'Provides HasErrors summary state without an ASP.NET Core dependency',
      ],
    },
    'AstraFlow.Security': {
      shortName: 'Security',
      categoryLabel: 'Security & Redaction',
      roleSummary:
        'Shared sensitive-name classification and redaction policy primitives consumed by OpenTelemetry, conventions, diagnostics, and generators.',
      capabilities: [
        'Default sensitive-name taxonomy for passwords, tokens, keys, credentials, salts, hashes',
        'AstraFlowRedactionPolicy with customizable replacement and taxonomies',
        'Zero external package dependencies; supports netstandard2.0 through net10.0',
      ],
    },
    'AstraFlow.Testing': {
      shortName: 'Testing',
      categoryLabel: 'Test Support',
      roleSummary:
        'Test-runner-neutral fakes (FakeMediator, FakeSender, FakePublisher), handler/pipeline harnesses, and AstraFlow mapping/diagnostics assertions.',
      capabilities: [
        'No dependency on xUnit, NUnit, MSTest, or mocking frameworks',
        'HandlerTestHarness, PipelineTestHarness, and NotificationHandlerTestHarness',
        'Deterministic TestSecureIdCodec and projection plan assertions',
      ],
    },
    'AstraFlow.Assertions': {
      shortName: 'Assertions',
      categoryLabel: 'Test Support',
      roleSummary:
        'Framework-neutral assertion API (Should()) for object graphs, structural collection equivalency, XML structure, HTTP response metadata, nullable values, numeric precision, dates and durations, strings, typed collection and runtime-type sequence checks, ordered sequence membership and key ordering, dictionary content and mapping equality, async sequences, enums, GUIDs, sync/async exceptions, and explicit failure scopes.',
      capabilities: [
        'Zero AstraFlow runtime or test-runner package dependencies',
        'Value-free predicates, ordinal/wildcard/timeout-bounded regex matching, and safe failure messages',
        'Strict positive/negative assertions for integral, floating-point, and decimal values, with defined zero, NaN, and infinity behavior',
        'Nullable scalar, enum, numeric, temporal, and GUID assertions on all four targets; nullable DateOnly and TimeOnly checks are available on net8.0, net9.0, and net10.0',
        'Non-consuming Stream.Should() capability and seekable metadata checks on all four targets, with safe null/disposed/unsupported-metadata failures and propagated unexpected I/O errors',
        'Exact HaveContent(byte[]) and NotHaveContent(byte[]) stream comparisons use a fixed 4 KiB buffer; seekable streams restore position after success, mismatch, or read failure, while non-seekable streams are consumed',
        'HaveElementAt(index, expected) checks a zero-based sequence position with EqualityComparer<T>.Default, returns the matched item through Which, and enumerates only as far as the requested index',
        'Ordered sequence checks accept params or IEnumerable expectations: ContainInOrder/NotContainInOrder allow gaps, while ContainInConsecutiveOrder/NotContainInConsecutiveOrder require adjacency; duplicate expected items need distinct positions, default equality compares nulls, expected inputs must be finite, and each input is enumerated at most once',
        'BeInAscendingOrderBy/BeInDescendingOrderBy check selected keys with an optional comparer; the selector runs once per item, ties pass, and failures report only the first failing index',
        'ContainEquivalentOf/NotContainEquivalentOf/AllBeEquivalentTo compare items structurally against one expected shape with per-call graph options; positive containment returns the matched item, all-item checks pass empty sequences, nested one-shot collections are snapshotted at most once across candidates, null subjects fail, and failures omit compared values',
        'Order-independent dictionary Equal/NotEqual over finite entry sequences uses default key/value equality and enumerates expected once; null expected sequences throw, null subjects fail, duplicate or null expected keys are rejected, and failures never print keys or values',
        'AllBeAssignableTo/AllBeOfType generic and Type overloads distinguish assignability from exact runtime type; generic all-item checks return typed chains, while ContainItemsAssignableTo/NotContainItemsAssignableTo scan at most once',
        'Async action and function completion-timeout assertions that validate before invocation, do not cancel the operation, observe late faults, and return function results or the original wrapper as appropriate',
        'Captured exception assertions for exact or assignable types, immediate inner exception presence/type/message checks, typed chaining, and single-invocation Where/NotWhere predicates',
        'XML root, direct-child, attribute, ordinal element-value, and document/element tree-equivalence assertions on all four targets; equivalence compares expanded names and attribute sets, preserves child-node order, treats CDATA as text, and omits compared values from failures',
        'HTTP response status and response/content header assertions that never read or dispose content and omit header values, body text, and request URIs from failure messages',
        'Async HTTP response-body equality and ordinal substring assertions buffer content without disposing the response and omit expected and actual body text from failures',
        'Numeric precision and temporal assertions with supported-target-framework boundaries',
        'Structural equivalency shaped by expected public properties, with per-call type-wide and path-specific comparers, nested-path exclusions, ordered or unordered sequences, dictionary matching, cycle handling, safe mismatch paths, and bounded depth',
        'AssertionScope aggregates failures from explicitly checked synchronous and awaited asynchronous actions, with nested-scope forwarding',
        'IAsyncEnumerable<T> assertions on net8.0, net9.0, and net10.0 for comparer-aware uniqueness and duplicate membership, predicate checks, sequential per-item callbacks, ordered/consecutive subsequences, single-item, ordered equality, and expected producer-exception checks; acquired enumerators are cancellation-aware and disposed',
      ],
    },
    'AstraFlow.Analyzers': {
      shortName: 'Analyzers',
      categoryLabel: 'Build Tooling',
      roleSummary:
        'Compile-time Roslyn diagnostics for mediator contracts, handler coverage, singleton captive dependencies, and mapper/projection hazards.',
      capabilities: [
        'Ships Roslyn compiler assets under analyzers/dotnet/cs without runtime lib/ bloat',
        'Catches missing/duplicate/ambiguous requests and unsafe reverse maps at compile time',
        'Reference with PrivateAssets="all" in consuming projects',
      ],
    },
    'AstraFlow.Generators': {
      shortName: 'Generators',
      categoryLabel: 'Build Tooling',
      roleSummary:
        'Incremental Roslyn source generator for closed mediator DI registrations, mapper/projection metadata, and opt-in [AstraGenerateMapping] methods.',
      capabilities: [
        'Generates deterministic AddAstraFlowGeneratedMediatorRegistrations() and mapper metadata',
        'Opt-in [AstraGenerateMapping] with collections, [AstraValueConverter], and [AstraDerivedMapping]',
        'Reference with PrivateAssets="all" alongside AstraFlow.Mediator or AstraFlow.Mapper',
      ],
    },
    'AstraFlow.Cli': {
      shortName: 'CLI',
      categoryLabel: '.NET Tool',
      roleSummary:
        'Global/local .NET tool (`astraflow`) for inspecting handlers/mappings, validating, diffing, reviewing assertion migration candidates, scanning migrations, and exporting Mermaid/DOT/Canvas JSON graphs.',
      capabilities: [
        'Relational request -> handler -> response Mermaid, pipeline, and event views',
        'Structured Canvas JSON, SARIF 2.1.0, Markdown, and JSON report exports',
        'Planned for 2.4.0: read-only, syntax-only assertion analysis with relative locations, method names, same-name review candidates, syntax-error warnings, and no source edits or semantic-equivalence claims',
        'Keeps its Roslyn syntax-analysis dependency in the CLI; AstraFlow.Assertions remains dependency-free',
        'Install as a .NET tool targeting net10.0, never as an app runtime dependency',
      ],
    },
    'AstraFlow.AspNetCore': {
      shortName: 'ASP.NET Core',
      categoryLabel: 'Boundary Integration',
      roleSummary:
        'Minimal API and controller helpers, endpoint filters, validation problem-details mapping, redacted diagnostics endpoints, and health summaries.',
      capabilities: [
        'Redacted diagnostics and health endpoints for ASP.NET Core net10.0 hosts',
        'ProblemDetails mapping for mediator/validation failures',
        'Stays strictly at the web boundary; domain assemblies never reference it',
      ],
    },
    'AstraFlow.FluentValidation': {
      shortName: 'FluentValidation',
      categoryLabel: 'Boundary Integration',
      roleSummary:
        'Pipeline validation behaviors running registered IValidator<TRequest> instances with fail-fast, aggregate, localization, and diagnostics support.',
      capabilities: [
        'Fresh ValidationContext per validator prevents failure leakage across requests',
        'Supports fail-fast and aggregate validation error modes',
        'Targets net8.0, net9.0, and net10.0',
      ],
    },
    'AstraFlow.OpenTelemetry': {
      shortName: 'OpenTelemetry',
      categoryLabel: 'Observability',
      roleSummary:
        'Payload-free ActivitySource spans and Meter metrics for mediator dispatch, notifications, and mapper/projection validation with shared redaction.',
      capabilities: [
        'Zero request/DTO payload capture; opt-in type-name tags and operation sampling',
        'Delegates redaction defaults to AstraFlow.Security policy',
        'Targets net8.0, net9.0, and net10.0',
      ],
    },
  },
  presetProfiles: {
    'cqrs-api': {
      label: 'CQRS Handlers Only',
      summary: 'Focused request/response dispatch and pipeline behaviors without object mapping.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    },
    'mediator-and-mapper': {
      label: 'Mediator + Explicit Mapper',
      summary: 'Convenience meta-package combining mediator dispatch and explicit declared mapping.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    },
    'efcore-read-models': {
      label: 'EF Core Read Models',
      summary: 'Explicit query projections with EF Core relational translation checks.',
      targetNote: 'Requires net10.0 for EF Core integration',
    },
    'conventions-security': {
      label: 'Opt-In Conventions + Security',
      summary: 'Pair-by-pair convention mapping plans backed by shared sensitive-name redaction policy.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    },
    'aot-generated-mapping': {
      label: 'AOT-Conscious Generators',
      summary: 'Explicit mediator/mapper core paired with compile-time source generators and analyzers.',
      targetNote: 'PrivateAssets="all" for compiler packages',
    },
    'diagnostics-observability': {
      label: 'ASP.NET Core + Telemetry',
      summary: 'Web host integration, FluentValidation pipeline, diagnostics reporting, OpenTelemetry, and CLI.',
      targetNote: 'Requires net10.0 for ASP.NET Core & CLI',
    },
    'test-project-suite': {
      label: 'Test Project Suite',
      summary: 'AstraFlow fakes, handler/pipeline harnesses, and fluent Should() assertions.',
      targetNote: 'Test projects only (xUnit, NUnit, MSTest, or TUnit)',
    },
  },
} as const;
