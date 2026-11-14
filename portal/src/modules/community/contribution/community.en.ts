export const communityEn = {
  seo: {
    title: 'Community',
    description:
      'Open-source AstraFlow collaboration on GitHub: source repository, issue tracker, pull requests, build verification, and coordinated security disclosures.',
  },
  page: {
    heroEyebrow: 'OPEN SOURCE. BUILT IN THE OPEN.',
    titleLead: 'The work',
    titleMain: 'is public',
    titleAccent: 'So is the thinking.',
    repoIntro:
      '{scope} Issues, pull requests, test suites, and security disclosures are tracked openly on GitHub under the MIT license.',
    repoScope:
      'AstraFlow welcomes focused issues, reproduction cases, benchmarks, and pull requests verified against AstraFlow.slnx.',
    exploreRepository: 'Explore the repository',
    openIssues: 'View open issues',
    noPrivateGate: 'NO PRIVATE COMMUNITY GATE. THE WORK IS ON GITHUB.',
    valueRead: 'Read before proposing',
    valueTradeoff: 'Explain the trade-off',
    valueVerify: 'Verify the outcome',
    pathwaysEyebrow: '02 / CONTRIBUTE & COLLABORATE',
    pathwaysTitle: 'Six ways to engage.',
    pathwaysCaption:
      'Every pathway, build check, and security process below reflects CONTRIBUTING.md, SECURITY.md, SUPPORT.md, and CODE_OF_CONDUCT.md.',
    pathNumber: 'PATH {number}',
    contributingFile: 'CONTRIBUTING.MD / CHECKLIST',
    buildBaseline: 'Build & verification baseline',
    buildInstructions:
      'Run the full solution build and test suite before submitting a focused pull request:',
    readContributing: 'Read CONTRIBUTING.md',
    securitySupport: 'SECURITY.MD & SUPPORT.MD',
    responsibleDisclosure:
      'Responsible disclosure with acknowledgement within {hours}',
    openAdvisory: 'Open security advisory',
    supportCoffee: 'Buy Me a Coffee',
    checklist:
      'Public API changes are documented.\nTests cover success and failure paths.\nError messages are actionable.\nPackage build passes with warnings as errors.\nSamples still compile.\nNo application-specific abstractions are introduced into package projects.',
    securityScopes:
      'Mediator dispatch and DI registration behavior\nMapper expression compilation and EF Core query translation\nRoslyn source generators and analyzers\nSecurity redaction, encryption helpers, diagnostics logging, and ASP.NET Core ProblemDetails output',
    codeOfConductSummary:
      'AstraFlow is an open source project for .NET developers. Participation in the project should stay technical, respectful, and focused on making the package family useful and maintainable. - Be direct and constructive. - Assume public comments, issues, and pull requests are read by people with different experience levels.',
  },
  pathways: {
    'source-repo': {
      title: 'Explore the Monorepo Source',
      summary:
        'Browse the .NET package suite, source generators, Roslyn analyzers, and verification harnesses directly on GitHub.',
      detail: 'Current stable AstraFlow packages target version {version} with modular project boundaries.',
      ctaLabel: 'Open GitHub Repository',
      tags: 'Repository\nMIT License\nSource',
    },
    'issue-tracker': {
      title: 'Report Bugs & Reproduction Cases',
      summary:
        'Open a targeted GitHub Issue with your AstraFlow package version, target framework, and minimal reproduction.',
      detail:
        'Include exception messages, compiler warnings, or mapping expression snippets so maintainers can reproduce quickly.',
      ctaLabel: 'Browse or File Issues',
      tags: 'Issues\nBug Reports\nRepros',
    },
    'pull-requests': {
      title: 'Submit Focused Pull Requests',
      summary:
        'Contribute handler optimizations, analyzer rules, EF Core projection fixes, or package documentation updates.',
      detail:
        'Keep each PR scoped to the owning package, update tests and docs, and confirm solution builds stay warning-clean.',
      ctaLabel: 'View Pull Requests',
      tags: 'Pull Requests\nReview\nCI',
    },
    'contributing-guide': {
      title: 'Contribution & Verification Checklist',
      summary:
        'Follow CONTRIBUTING.md conventions: build AstraFlow.slnx, run package and generator test suites, and verify XML docs.',
      detail:
        'Respect package boundaries (AstraFlow.Contracts stays dependency-free; Analyzers & Generators require PrivateAssets="all").',
      ctaLabel: 'Read CONTRIBUTING.md',
      tags: 'CONTRIBUTING.md\nTest Matrix\nQuality',
    },
    'security-policy': {
      title: 'Coordinated Security Disclosures',
      summary:
        'Report redaction, serialization, source-generation, or endpoint vulnerabilities privately via GitHub Security Advisories.',
      detail:
        'Do not open public issues for sensitive security bugs. Target initial maintainer triage acknowledgement within {hours}.',
      ctaLabel: 'Read SECURITY.md',
      tags: 'SECURITY.md\n72h Target\nAdvisories',
    },
    'documentation-hub': {
      title: 'Product Documentation & Guides',
      summary:
        'Consult the developer documentation, package selection matrix, pipeline patterns, and upgrade notes before proposing API changes.',
      detail:
        'Every public API surface and compatibility baseline is documented in the AstraFlow documentation hub.',
      ctaLabel: 'Open Documentation Hub',
      tags: 'Docs\nQuick Start\nMigration',
    },
  },
  network: {
    figureLabel: 'FIGURE 05 / CONTRIBUTION CURRENT',
    signalPinned: 'PINNED · ',
    signalActive: 'SIGNAL ACTIVE · {number} {pathway}',
    autoRouting: 'IDLE / AUTO-ROUTING · {number} {pathway}',
    networkAria:
      'Isometric AstraFlow contribution network connecting the central hub to six repository pathways',
    conduitAria: 'Conduit between AstraFlow core hub and {pathway}',
    pathwayAria: '{number} {pathway}: inspect pathway',
    pathwaysAria: 'AstraFlow contribution pathways',
    inspectorKicker: 'CONDUIT INSPECTOR · {number} {pathway}',
    resetIdle: 'Reset idle',
    destinationLink: 'Open destination ↗',
    baselineRuleLabel: 'Baseline verification rule (CONTRIBUTING.md)',
    pullRequestRuleLabel: 'PR checklist rule (CONTRIBUTING.md)',
    contributingRuleLabel: 'Verification baseline (CONTRIBUTING.md)',
    contributingRuleText: 'Verify locally before opening a PR: {command}',
    securityRuleLabel: 'Security disclosure rule (SECURITY.md · {hours} SLA)',
    contributionRuleLabel: 'Contribution guideline',
    shortLabels: {
      'source-repo': 'Repository',
      'issue-tracker': 'Issues',
      'pull-requests': 'Pull Requests',
      'contributing-guide': 'Contributing',
      'security-policy': 'Security',
      'documentation-hub': 'Architecture',
    },
  },
  study: {
    eyebrow: '03 / BUILT TO BE STUDIED',
    titleLead: 'One codebase.',
    titleAccent: 'Many good questions.',
    lead:
      'No invented chat rooms, testimonials, star counters, or vanity statistics. The repository, test suites, and documentation are the primary channels.',
    questionsAria: 'Architectural study questions across AstraFlow subsystems',
    readDocs: 'Read the documentation',
    figureLabel: 'FIGURE 06 / FOUR-BRANCH CODEBASE TOPOLOGY',
    relayAria: 'Interactive four-branch AstraFlow codebase study topology',
    branchSelectorsAria: 'Synchronized architecture branch selectors',
    telemetryLabel: 'RELAY TELEMETRY · {number} / {topic}',
    relayInitial: 'Relay topology active across four documented AstraFlow subsystems.',
    relayContinuous:
      'Continuous four-branch study relay sweeping active subsystem pathways.',
    relayBranch:
      'Study relay tracking active branch ({branch}) across AstraFlow subsystems.',
    questions: {
      dispatch: {
        topic: 'DISPATCH',
        question: 'How does generated mediator dispatch stay reflection-free?',
        answer:
          'Compile-time source generation emits typed dispatchers and closed pipeline invocations directly against your handlers instead of runtime reflection lookup.',
        cta: 'Read generated dispatch guide ↗',
      },
      mapping: {
        topic: 'MAPPING',
        question: 'How are object mapping pairs verified at startup?',
        answer:
          'Source-generated mapping plans match members at compile time while Roslyn analyzers and startup verification catch unmapped properties before production.',
        cta: 'Read mapper guide ↗',
      },
      diagnostics: {
        topic: 'DIAGNOSTICS',
        question: 'How do diagnostic reports guarantee zero payload leakage?',
        answer:
          'Diagnostics restrict snapshots to structural route/handler metadata and explicit redaction summaries so user request payloads never serialize into reports.',
        cta: 'Read diagnostics guide ↗',
      },
      contracts: {
        topic: 'CONTRACTS',
        question: 'Why does AstraFlow.Contracts stay zero-dependency?',
        answer:
          'Keeping the contracts assembly pure lets domain models declare request, response, and notification markers without pulling ASP.NET or container weights.',
        cta: 'Read architecture ↗',
      },
    },
  },
} as const;
