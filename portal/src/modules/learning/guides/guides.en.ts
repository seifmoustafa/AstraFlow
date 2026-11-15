export const guidesEn = {
  seo: {
    title: 'Guides',
    description:
      'Follow six practical learning milestones from dependency-free contracts and mediator pipelines to EF Core projections, analyzers, diagnostics, and assertion APIs.',
  },
  page: {
    heroEyebrow: 'LEARNING SHOULD FEEL LIKE FORWARD MOTION',
    titleLead: 'From curious',
    titleAccent: 'to confident.',
    heroLead:
      'Six practical journeys through AstraFlow — from dependency-free contracts and mediator pipelines to EF Core projections, Roslyn analyzers, diagnostics, and fluent test assertions.',
    startMilestone: 'Start Milestone 01',
    gettingStarted: 'Getting Started Docs',
    pathsEyebrow: '02 / SIX PRACTICAL PATHS',
    pathsTitleLead: 'Learn by',
    pathsTitleAccent: 'doing.',
    pathsCaption:
      'Every path connects directly to the developer documentation and runnable code patterns across the AstraFlow suite.',
    readGuide: 'READ GUIDE →',
    paths: {
      request: {
        eyebrow: '01 / FIRST REQUEST',
        title: 'Send something.',
        description:
          'From dependency-free contract definition to a typed mediator response without pulling DI or ASP.NET Core into domain assemblies.',
      },
      pipeline: {
        eyebrow: '02 / COMPOSITION',
        title: 'Design a pipeline.',
        description:
          'Keep request behaviors, pre/post processors, notifications, and streaming dispatches explicit and strictly scoped.',
      },
      data: {
        eyebrow: '03 / DATA',
        title: 'Map with intent.',
        description:
          'Declare object pairs explicitly, enforce pairing coverage, and emit EF Core IQueryable projections without runtime surprises.',
      },
      inspection: {
        eyebrow: '04 / INSPECTION',
        title: 'Know your wiring.',
        description:
          'Inspect startup registration reports, redaction guardrails, OpenTelemetry traces, and ASP.NET Core diagnostics defaults.',
      },
      confidence: {
        eyebrow: '05 / CONFIDENCE',
        title: 'Test important parts.',
        description:
          'Combine FakeMediator test harnesses with fluent AstraFlow.Assertions expectations for fast, isolated verification.',
      },
      migration: {
        eyebrow: '06 / MIGRATION',
        title: 'Move without guessing.',
        description:
          'Plan package upgrades across versions with compatibility matrices and migration guidance.',
      },
    },
  },
  milestones: {
    contracts: {
      title: '01 Contracts',
      shortTitle: 'Contracts',
      subtitle:
        'Dependency-free message and handler interfaces for your Domain & Application layers.',
      summary:
        'Keep your domain and application abstractions clean without pulling DI containers, ASP.NET Core, or Entity Framework into shared contract assemblies. Define requests, commands, notifications, and streaming queries once against AstraFlow.Contracts.',
      keyConcepts: 'IRequest<out TResponse> & IRequest markers for commands and queries\nINotification & IStreamRequest<out TResponse> abstractions\nZero runtime or container coupling in shared domain projects',
      docLabel: 'Read Architecture Overview',
      secondaryLabels: 'Package Selection Guide\nAstraFlow.Contracts',
    },
    'mediator-pipelines': {
      title: '02 Mediator & Pipelines',
      shortTitle: 'Mediator & Pipelines',
      subtitle:
        'High-throughput request dispatch, validation behaviors, and HTTP endpoint helpers.',
      summary:
        'Register AstraFlow handlers once at startup and dispatch commands, queries, and domain events through ISender and IPublisher. Layer cross-cutting IPipelineBehavior<TRequest, TResponse> validation with FluentValidation and Minimal API / ProblemDetails integration via AstraFlow.AspNetCore.',
      keyConcepts: 'ISender.Send / IPublisher.Publish with cancellation-token propagation\nOrdered IPipelineBehavior<TRequest, TResponse> execution\nFluentValidation behavior + ASP.NET Core ProblemDetails endpoint mapping',
      docLabel: 'Read Mediator Guide',
      secondaryLabels: 'Getting Started\nGenerated Dispatch',
    },
    'explicit-mapping': {
      title: '03 Explicit Mapping',
      shortTitle: 'Explicit Mapping',
      subtitle:
        'Compile-checked object mapping, naming conventions, and EF Core IQueryable projections.',
      summary:
        'Avoid opaque runtime reflection surprises. AstraFlow.Mapper provides explicit mapping registration and IMapper execution, while Mapper.Conventions handles predictable property conventions and Mapper.EntityFrameworkCore translates ProjectTo<TDestination>() expressions directly into SQL.',
      keyConcepts: 'Explicit IMapper & mapping profiles without silent member skips\nModular convention packs via AstraFlow.Mapper.Conventions\nDatabase-level Select translation with ProjectTo<OrderDto>()',
      docLabel: 'Read Mapper & Projections Guide',
      secondaryLabels: 'Generated Mapping\nCompatibility Matrix',
    },
    'source-generators': {
      title: '04 Source Generators',
      shortTitle: 'Source Generators',
      subtitle:
        'Zero-reflection handler and mapper emission with build-time Roslyn diagnostics.',
      summary:
        'Reference AstraFlow.Generators and AstraFlow.Analyzers with PrivateAssets="all" so compile-time code generation and analyzer diagnostics run during build without shipping compiler dependencies in your runtime output.',
      keyConcepts: 'PrivateAssets="all" keeps analyzer & generator DLLs out of runtime dependencies\nIncremental Roslyn generation for AOT-friendly handler dispatch & mapping\nBuild-time diagnostics for unmapped members, missing handlers, and unsafe patterns',
      docLabel: 'Read Source Generators Guide',
      secondaryLabels: 'Getting Started\nAstraFlow.Generators',
    },
    'diagnostics-cli': {
      title: '05 Diagnostics & CLI',
      shortTitle: 'Diagnostics & CLI',
      subtitle:
        'Safe telemetry, redaction guardrails, OpenTelemetry traces, and the global dotnet CLI tool.',
      summary:
        'Observe request execution without leaking sensitive fields. AstraFlow.Diagnostics and AstraFlow.OpenTelemetry export structured traces and ActivitySource spans while AstraFlow.Security enforces payload redaction defaults. Install AstraFlow.Cli as a dotnet global tool for local workspace diagnostics.',
      keyConcepts: 'Safe-by-default diagnostics that never emit raw secrets or payload PII\nOpenTelemetry ActivitySource & metric integration for mediator dispatch\nAstraFlow.Cli installed via dotnet tool install --global ({version})',
      docLabel: 'Read Diagnostics Guide',
      secondaryLabels: 'Security & Redaction\nCLI Reference',
    },
    'testing-harnesses': {
      title: '06 Testing & Assertions',
      shortTitle: 'Testing & Assertions',
      subtitle:
        'Deterministic mediator harnesses paired with fluent Should() assertions.',
      summary:
        'Verify handlers, pipeline ordering, and notifications in isolation with AstraFlow.Testing and FakeMediator. Pair your test harness with AstraFlow.Assertions for readable Should() checks and explicit AssertionScope collection from checked actions, with zero external runner coupling.',
      keyConcepts: 'FakeMediator and HandlerTestHarness for isolated pipeline & notification verification\nFluent Should(), Be(), NotBeEmpty(), and NotThrowAsync() assertion primitives\nType assertions compare exact runtime Type identity and inspect metadata without invoking user code\nDictionary NotContain checks reject key/value pairs or matching predicates in a single pass with value-safe failures\nHaveElementPreceding and HaveElementSucceeding inspect the immediate neighbor of the first matching sequence item using default equality\nNullable scalar, enum, numeric, temporal, and GUID assertions on netstandard2.0, net8.0, net9.0, and net10.0; nullable DateOnly and TimeOnly checks require net8.0 or later\nNon-consuming Stream.Should() checks on all four targets for capabilities, length, position, and beginning/end metadata\nCompleteWithinAsync and NotCompleteWithinAsync time-bound returned Tasks without canceling operations; function completion returns TResult and non-completion preserves its assertion wrapper\nExceptionAssertions chains exact/assignable type checks, immediate inner exception assertions, and wildcard inner-message matching without exposing failure details\nObject-graph equivalency with expected-side property selection, type-wide and path-specific comparers, path exclusions, optional unordered sequences, and dictionaries\nAssertionScope collects failures only from explicit Check and awaited CheckAsync callbacks; separate checks are needed because each callback stops at its first failure\nIAsyncEnumerable<T> assertions on net8.0, net9.0, and net10.0 for predicate membership, uniqueness, duplicate-aware matching, ordered/consecutive subsequences, sequential per-item callbacks, and expected producer exceptions\nAsync checks acquire and dispose one enumerator per call; expected sequences are read once and full-evaluation checks need finite sources\nClean test-project isolation with zero production runtime overhead',
      docLabel: 'Read Testing Guide',
      secondaryLabels: 'Assertions Reference\nPackage Selection',
    },
  },
  runway: {
    curriculumTitle: '06 MILESTONES · RUNNABLE C# · CLI VERIFIED',
    curriculumCounter: 'STEP {current} / {total}',
    quickJumpAria: 'Quick jump to learning milestone',
    runwayName: 'ASTRAFLOW / KINETIC LEARNING RUNWAY',
    activeCount: 'MILESTONE {current} OF {total}',
    liveProgression: 'LIVE PROGRESSION · CONTINUOUS',
    previousMilestone: '← Previous',
    previousMilestoneAria: 'Previous milestone',
    nextMilestone: 'Next milestone →',
    nextMilestoneAria: 'Next milestone',
    milestonesAria: 'AstraFlow learning milestones',
    milestoneHeading: 'MILESTONE {step} / {title}',
    suite: 'AstraFlow {version} Suite',
    requiredPackages: 'Required packages for this milestone',
    cueContracts: 'CONTRACTS',
    cuePipelines: 'PIPELINES',
    cueProjections: 'PROJECTIONS',
    cueGenerators: 'ROSLYN AST',
    cueTelemetry: 'TELEMETRY',
    cueTesting: 'HARNESSES',
    milestoneAnnouncement: 'Milestone {step}: {title}',
    copiedAnnouncement: '{label} copied to clipboard.',
    fallbackAnnouncement: 'Select the {label} manually to copy.',
    copySnippet: 'Copy snippet',
    copied: 'Copied ✓',
    copyVerification: 'Copy CLI check',
    copyVerificationLabel: 'Verification CLI check',
    localCheckTitles: {
      contracts: 'Local verification — Contracts assembly',
      'mediator-pipelines': 'Local verification — Mediator & pipelines',
      'explicit-mapping': 'Local verification — Explicit mapping & projections',
      'source-generators': 'Local verification — Generators & analyzers',
      'diagnostics-cli': 'Local verification — CLI & redaction',
      'testing-harnesses': 'Local verification — Testing & assertions',
      default: 'Local verification — Solution suite',
    },
    localCheckNotes: {
      contracts:
        'Confirms shared message and handler contracts compile with zero framework or DI dependencies.',
      'mediator-pipelines':
        'Executes handler resolution, pipeline ordering, notifications, and streaming dispatch tests.',
      'explicit-mapping':
        'Validates explicit mapper rules, registration checks, and EF Core IQueryable projections.',
      'source-generators':
        'Verifies incremental Roslyn source generation and build-time diagnostic emission.',
      'diagnostics-cli':
        'Runs the repository CLI inspector directly from source against the AstraFlow solution.',
      'testing-harnesses':
        'Runs both AstraFlow.Testing mediator harnesses and AstraFlow.Assertions verification suites.',
      default: 'Builds and tests the complete AstraFlow solution from source.',
    },
  },
} as const;
