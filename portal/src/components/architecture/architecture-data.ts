export interface ArchifyArtifact {
  id: string;
  title: string;
  type: 'explainer' | 'sequence' | 'tree' | 'architecture';
  description: string;
  filename: string;
  sha256: string;
  verifiedGate: string;
  badge: string;
  highlights: string[];
}

export const ARCHIFY_ARTIFACTS: ArchifyArtifact[] = [
  {
    id: 'execution-pipeline',
    title: 'Request Dispatch & Redaction Pipeline',
    type: 'sequence',
    description: 'Deterministic dispatch across IMediator, pipeline behaviors, OpenTelemetry ActivitySource, and security-safe redactor gate.',
    filename: 'execution-pipeline.html',
    sha256: '7913ba56c3a3',
    verifiedGate: '9/9 Archify artifact checks + showcase quality',
    badge: 'Core Dispatch Flow',
    highlights: [
      'Predictable request and notification dispatch',
      'Configurable async pipeline short-circuiting',
      'Automatic PII & secret redactor before OpenTelemetry export'
    ]
  },
  {
    id: 'ecosystem-tree',
    title: '16-Package Ecosystem Architecture',
    type: 'tree',
    description: 'Hierarchical containment breakdown of the 16 AstraFlow packages across 6 decoupled architectural layers.',
    filename: 'ecosystem-tree.html',
    sha256: 'f58ea94c5a1a',
    verifiedGate: '9/9 Archify artifact checks + showcase quality',
    badge: '16-Package Map',
    highlights: [
      'Strict dependency isolation starting with zero-dependency AstraFlow.Contracts',
      'Pluggable mapper & EF Core compiled projection trees',
      'Runner-neutral assertions (v2.4 preview) & Roslyn code analyzers'
    ]
  },
  {
    id: 'portal-strategy',
    title: 'AstraFlow Portal & Architecture Strategy',
    type: 'explainer',
    description: 'Comprehensive architectural brief, visual identity guidelines, and 6-pillar platform roadmap for AstraFlow.',
    filename: 'portal-strategy.html',
    sha256: '4a6b29f9e11c',
    verifiedGate: '12/12 Archify explainer checks + verified layout',
    badge: 'Platform Strategy',
    highlights: [
      'Version 0.2 The Trace / Engineered Clarity design language',
      'Dual-theme accessibility and full EN/AR internationalization',
      'Interactive Understand Anything knowledge graph integration'
    ]
  }
];

export interface LayerBlueprint {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  description: string;
  packages: string[];
  rules: string[];
}

export const LAYER_BLUEPRINTS: LayerBlueprint[] = [
  {
    id: 'contracts',
    name: '1. Shared Contracts Layer',
    color: '#72D5DE',
    borderColor: '#405267',
    description: 'The foundation layer with zero internal or external third-party dependencies.',
    packages: ['AstraFlow.Contracts'],
    rules: [
      'Never imports third-party frameworks (no ASP.NET Core, no EF Core)',
      'Defines IMediator, IRequest, IRequestHandler, IObjectMapper, IProjectionProvider',
      'Zero breaking changes policy across minor releases'
    ]
  },
  {
    id: 'dispatch',
    name: '2. Core Dispatch & Pipelines',
    color: '#89CBA4',
    borderColor: '#405267',
    description: 'High-throughput async mediator engine, pipeline delegation chain, and endpoint bindings.',
    packages: ['AstraFlow.Mediator', 'AstraFlow.AspNetCore', 'AstraFlow.FluentValidation', 'AstraFlow'],
    rules: [
      'Executes pre/post pipeline behaviors in registration order',
      'Full cancellation token propagation to every handler',
      'ASP.NET Core Minimal API endpoint route mappers'
    ]
  },
  {
    id: 'mapping',
    name: '3. Mapping & Projections',
    color: '#F0C57C',
    borderColor: '#405267',
    description: 'Compile-time executable mappers and EF Core queryable projection trees.',
    packages: ['AstraFlow.Mapper', 'AstraFlow.Mapper.EntityFrameworkCore', 'AstraFlow.Mapper.Conventions'],
    rules: [
      'Roslyn compile-time source generation replaces reflection',
      'Translates expressions directly to SQL via EF Core IQueryable',
      'Circular reference detection and deterministic depth limits'
    ]
  },
  {
    id: 'roslyn',
    name: '4. Roslyn Tooling & Generators',
    color: '#D9A477',
    borderColor: '#405267',
    description: 'Compiler-integrated diagnostic rules (AFAN0101-AFAN0304) and source generators.',
    packages: ['AstraFlow.Analyzers', 'AstraFlow.Generators', 'AstraFlow.Cli'],
    rules: [
      'AFAN0101: Missing handler registration diagnostics',
      'AFAN0302: Incompatible mapping projection targets in queryable trees',
      'Generates direct IL/C# mapping methods at build time'
    ]
  },
  {
    id: 'observability',
    name: '5. Observability & Security Gate',
    color: '#F39A98',
    borderColor: '#405267',
    description: 'Distributed tracing via OpenTelemetry with defense-in-depth sanitization.',
    packages: ['AstraFlow.Diagnostics', 'AstraFlow.Security', 'AstraFlow.OpenTelemetry'],
    rules: [
      'ActivitySource with W3C TraceContext standards',
      'PII & secret redactor prevents payload leaks in telemetry tags',
      'Strict diagnostic telemetry masking defaults'
    ]
  },
  {
    id: 'testing',
    name: '6. Testing & Assertions',
    color: '#A5B4C4',
    borderColor: '#405267',
    description: 'Runner-neutral assertion engine and mediator pipeline test doubles.',
    packages: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    rules: [
      'Runner-neutral assertions (works with xUnit, NUnit, MSTest)',
      'Privacy-safe failure messages with token redaction',
      'Isolated TestMediator harness with spy recorder'
    ]
  }
];
