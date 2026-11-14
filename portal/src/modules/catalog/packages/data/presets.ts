import type { ComposerPresetDefinition } from './model';

/** Structural preset definitions; presentation is supplied by the feature locale. */
export function getComposerPresets(): ComposerPresetDefinition[] {
  return [
    {
      id: 'cqrs-api',
      packageIds: ['AstraFlow.Mediator'],
      recommendedDocHref: '/docs/mediator',
    },
    {
      id: 'mediator-and-mapper',
      packageIds: ['AstraFlow'],
      recommendedDocHref: '/docs/getting-started',
    },
    {
      id: 'efcore-read-models',
      packageIds: ['AstraFlow.Mapper', 'AstraFlow.Mapper.EntityFrameworkCore'],
      recommendedDocHref: '/docs/entity-framework-core',
    },
    {
      id: 'conventions-security',
      packageIds: [
        'AstraFlow.Mapper',
        'AstraFlow.Mapper.Conventions',
        'AstraFlow.Security',
      ],
      recommendedDocHref: '/docs/convention-mapping',
    },
    {
      id: 'aot-generated-mapping',
      packageIds: [
        'AstraFlow.Mediator',
        'AstraFlow.Mapper',
        'AstraFlow.Generators',
        'AstraFlow.Analyzers',
      ],
      recommendedDocHref: '/docs/generated-dispatch',
    },
    {
      id: 'diagnostics-observability',
      packageIds: [
        'AstraFlow',
        'AstraFlow.AspNetCore',
        'AstraFlow.FluentValidation',
        'AstraFlow.Diagnostics',
        'AstraFlow.OpenTelemetry',
        'AstraFlow.Cli',
      ],
      recommendedDocHref: '/docs/opentelemetry',
    },
    {
      id: 'test-project-suite',
      packageIds: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
      recommendedDocHref: '/docs/testing',
    },
  ];
}
