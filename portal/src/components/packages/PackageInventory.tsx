import React from 'react';
import Link from 'next/link';

export const PINNED_SOURCE_COMMIT_SHA =
  'b163535864199bfb05cef62807d89509ac2239f8';

export interface PackageIndexCard {
  index: string;
  title: string;
  description: string;
  href: string;
}

export interface CanonicalPackageRecord {
  id: string;
  category:
    | 'CONVENIENCE'
    | 'CONTRACTS'
    | 'DISPATCH'
    | 'MAPPING'
    | 'BUILD TIME'
    | 'TOOLS'
    | 'OPTIONAL'
    | 'SAFE DEFAULTS'
    | 'TESTING';
  summary: string;
  releaseStatus:
    | 'Umbrella verified (2.2.0); verify per package (2.3.0 source milestone)'
    | 'Verify per package on NuGet (2.3.0 source milestone)'
    | 'Unpublished / 2.4.0 work in progress (source only)';
  docHref: string;
  sourcePath: string;
}

export const PACKAGE_INDEX_CARDS: PackageIndexCard[] = [
  {
    index: 'CONVENIENCE',
    title: 'AstraFlow',
    description: 'Mediator + Mapper convenience entry.',
    href: '/docs/package-selection',
  },
  {
    index: 'CONTRACTS',
    title: 'Contracts',
    description: 'Shared abstractions at the boundary.',
    href: '/docs/api-reference',
  },
  {
    index: 'BUILD TIME',
    title: 'Analyzers',
    description: 'Compiler diagnostics and hints.',
    href: '/docs/analyzers',
  },
  {
    index: 'TOOLS',
    title: 'CLI',
    description: 'Inspect / validate / report / graph.',
    href: '/docs/cli',
  },
  {
    index: 'OPTIONAL',
    title: 'Integrations',
    description: 'ASP.NET Core, EF Core, telemetry and more.',
    href: '/docs/aspnetcore',
  },
  {
    index: 'SAFE DEFAULTS',
    title: 'Security',
    description: 'Shared name classification and redaction.',
    href: '/docs/security',
  },
];

export const CANONICAL_PACKAGE_CATALOG: CanonicalPackageRecord[] = [
  {
    id: 'AstraFlow',
    category: 'CONVENIENCE',
    summary: 'Convenience metapackage combining AstraFlow.Mediator and AstraFlow.Mapper.',
    releaseStatus:
      'Umbrella verified (2.2.0); verify per package (2.3.0 source milestone)',
    docHref: '/docs/package-selection',
    sourcePath: 'src/AstraFlow/AstraFlow.csproj',
  },
  {
    id: 'AstraFlow.Contracts',
    category: 'CONTRACTS',
    summary: 'Shared request, notification, stream, mapping, and projection abstractions.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/api-reference',
    sourcePath: 'src/AstraFlow.Contracts/AstraFlow.Contracts.csproj',
  },
  {
    id: 'AstraFlow.Mediator',
    category: 'DISPATCH',
    summary: 'Explicit request, stream, and notification dispatch with pipeline behaviors.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/mediator',
    sourcePath: 'src/AstraFlow.Mediator/AstraFlow.Mediator.csproj',
  },
  {
    id: 'AstraFlow.Mapper',
    category: 'MAPPING',
    summary: 'Explicit object mapping and queryable projection rules.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/mapper',
    sourcePath: 'src/AstraFlow.Mapper/AstraFlow.Mapper.csproj',
  },
  {
    id: 'AstraFlow.Mapper.Conventions',
    category: 'MAPPING',
    summary: 'Opt-in property convention mapping extensions for AstraFlow.Mapper.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/convention-mapping',
    sourcePath:
      'src/AstraFlow.Mapper.Conventions/AstraFlow.Mapper.Conventions.csproj',
  },
  {
    id: 'AstraFlow.Mapper.EntityFrameworkCore',
    category: 'OPTIONAL',
    summary: 'EF Core queryable projection translation validation and helpers.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/entity-framework-core',
    sourcePath:
      'src/AstraFlow.Mapper.EntityFrameworkCore/AstraFlow.Mapper.EntityFrameworkCore.csproj',
  },
  {
    id: 'AstraFlow.Diagnostics',
    category: 'TOOLS',
    summary: 'Registration inspection, validation reports, and diagnostic snapshots.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/diagnostics',
    sourcePath: 'src/AstraFlow.Diagnostics/AstraFlow.Diagnostics.csproj',
  },
  {
    id: 'AstraFlow.Security',
    category: 'SAFE DEFAULTS',
    summary: 'Shared sensitive-name classification and redaction policies.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/security',
    sourcePath: 'src/AstraFlow.Security/AstraFlow.Security.csproj',
  },
  {
    id: 'AstraFlow.Testing',
    category: 'TESTING',
    summary: 'Framework-neutral test doubles, recorders, and verification harnesses.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/testing',
    sourcePath: 'src/AstraFlow.Testing/AstraFlow.Testing.csproj',
  },
  {
    id: 'AstraFlow.Assertions',
    category: 'TESTING',
    summary:
      'Runner-neutral assertions with zero package dependencies and privacy-safe failure output (2.4.0 work in progress, source only).',
    releaseStatus: 'Unpublished / 2.4.0 work in progress (source only)',
    docHref: '/docs/assertions',
    sourcePath: 'src/AstraFlow.Assertions/AstraFlow.Assertions.csproj',
  },
  {
    id: 'AstraFlow.Analyzers',
    category: 'BUILD TIME',
    summary: 'Build-time Roslyn diagnostics and configuration hints.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/analyzers',
    sourcePath: 'src/AstraFlow.Analyzers/AstraFlow.Analyzers.csproj',
  },
  {
    id: 'AstraFlow.Generators',
    category: 'BUILD TIME',
    summary: 'Opt-in compile-time handler registration and generated mapping.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/generators',
    sourcePath: 'src/AstraFlow.Generators/AstraFlow.Generators.csproj',
  },
  {
    id: 'AstraFlow.Cli',
    category: 'TOOLS',
    summary: 'Command-line tool for inspect, validate, report, diff, graph, and scan.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/cli',
    sourcePath: 'src/AstraFlow.Cli/AstraFlow.Cli.csproj',
  },
  {
    id: 'AstraFlow.AspNetCore',
    category: 'OPTIONAL',
    summary: 'ASP.NET Core endpoint, problem-details, and diagnostic route integration.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/aspnetcore',
    sourcePath: 'src/AstraFlow.AspNetCore/AstraFlow.AspNetCore.csproj',
  },
  {
    id: 'AstraFlow.FluentValidation',
    category: 'OPTIONAL',
    summary: 'FluentValidation pipeline behavior integration for AstraFlow.Mediator.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/fluentvalidation',
    sourcePath:
      'src/AstraFlow.FluentValidation/AstraFlow.FluentValidation.csproj',
  },
  {
    id: 'AstraFlow.OpenTelemetry',
    category: 'OPTIONAL',
    summary: 'OpenTelemetry traces and metrics using shared redaction policies.',
    releaseStatus: 'Verify per package on NuGet (2.3.0 source milestone)',
    docHref: '/docs/observability',
    sourcePath: 'src/AstraFlow.OpenTelemetry/AstraFlow.OpenTelemetry.csproj',
  },
];

export function PackageInventory() {
  return (
    <section className="section" id="directory">
      <div className="site-wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">02 / THE PACKAGE INDEX</p>
            <h2>
              Specific tools.
              <br />
              <span className="ital signal">Clear boundaries.</span>
            </h2>
          </div>
          <p className="section-caption">
            Real package names; supporting details belong in repository-backed
            Docs.
          </p>
        </div>
        <div className="card-list">
          {PACKAGE_INDEX_CARDS.map((card) => (
            <Link key={card.title} className="line-card" href={card.href}>
              <span className="index tiny">{card.index}</span>
              <h3>{card.title}</h3>
              <small>{card.description}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PackageInventory;
