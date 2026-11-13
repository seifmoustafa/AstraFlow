'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  createCamera,
  createIsoPlateGeometry,
  fitCamera,
  IsoPrism,
  IsoSignalConduit,
  open,
  poly,
  projectCamera,
  r2,
  staggerDelayMs,
  useReducedMotionSafe,
  useViewportActivity,
  WARM_FOREST_PALETTE,
  type IsoPlateGeometry,
  type Point2,
  type Point3,
} from '@/components/hairline';
import styles from './LivingFlowAtlas.module.css';

export type FlowCapabilityId = 'dispatch' | 'mapping' | 'diagnostics' | 'testing';
export type FlowStageIndex = 0 | 1 | 2 | 3;
export type FlowStageRole = 'CONTRACT' | 'DECISION' | 'IMPLEMENTATION' | 'RESULT';

/**
 * Single discriminated state controlling capability, active stage, owning package metadata,
 * pulse playback, and clipboard feedback.
 */
export type FlowAtlasState =
  | {
      readonly capability: 'dispatch';
      readonly stage: FlowStageIndex;
      readonly packageId: 'AstraFlow.Mediator';
      readonly packageVersion: '2.3.0';
      readonly docHref: '/docs/mediator';
      readonly pulsePaused: boolean;
      readonly copyStatus: 'idle' | 'copied' | 'fallback';
    }
  | {
      readonly capability: 'mapping';
      readonly stage: FlowStageIndex;
      readonly packageId: 'AstraFlow.Mapper';
      readonly packageVersion: '2.3.0';
      readonly docHref: '/docs/mapper';
      readonly pulsePaused: boolean;
      readonly copyStatus: 'idle' | 'copied' | 'fallback';
    }
  | {
      readonly capability: 'diagnostics';
      readonly stage: FlowStageIndex;
      readonly packageId: 'AstraFlow.Diagnostics';
      readonly packageVersion: '2.3.0';
      readonly docHref: '/docs/diagnostics';
      readonly pulsePaused: boolean;
      readonly copyStatus: 'idle' | 'copied' | 'fallback';
    }
  | {
      readonly capability: 'testing';
      readonly stage: FlowStageIndex;
      readonly packageId: 'AstraFlow.Testing';
      readonly packageVersion: '2.3.0';
      readonly docHref: '/docs/testing';
      readonly pulsePaused: boolean;
      readonly copyStatus: 'idle' | 'copied' | 'fallback';
    };

type FlowAtlasAction =
  | { type: 'SELECT_CAPABILITY'; capability: FlowCapabilityId }
  | { type: 'SELECT_STAGE'; stage: FlowStageIndex }
  | { type: 'SET_COPY_STATUS'; status: 'idle' | 'copied' | 'fallback' };

interface StageSpec {
  readonly label: string;
  readonly subLabel: string;
  readonly role: FlowStageRole;
  readonly heading: string;
  readonly explanation: string;
  readonly apiSymbol: string;
  readonly highlightLines: readonly [number, number];
}

interface CapabilitySpec {
  readonly id: FlowCapabilityId;
  readonly indexLabel: string;
  readonly shortTab: string;
  readonly packageId: FlowAtlasState['packageId'];
  readonly packageVersion: '2.3.0';
  readonly docHref: FlowAtlasState['docHref'];
  readonly docLabel: string;
  readonly headline: string;
  readonly fileName: string;
  readonly codeLines: readonly string[];
  readonly stages: readonly [StageSpec, StageSpec, StageSpec, StageSpec];
}

const CAPABILITIES: Readonly<Record<FlowCapabilityId, CapabilitySpec>> = {
  dispatch: {
    id: 'dispatch',
    indexLabel: '01',
    shortTab: 'Request Dispatch',
    packageId: 'AstraFlow.Mediator',
    packageVersion: '2.3.0',
    docHref: '/docs/mediator',
    docLabel: 'Mediator guide',
    headline: 'A request, intentionally routed.',
    fileName: 'Orders/CreateOrderFlow.cs',
    codeLines: [
      'using AstraFlow.Mediator;',
      '',
      'public sealed record CreateOrder(string Number) : IRequest<OrderCreated>;',
      'public sealed record OrderCreated(Guid Id, string Number);',
      '',
      'services.AddAstraFlowMediator(',
      '    validateRequestCoverage: true,',
      '    assemblyMarkerTypes: typeof(CreateOrderHandler));',
      'services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));',
      '',
      'public sealed class CreateOrderHandler : IRequestHandler<CreateOrder, OrderCreated>',
      '{',
      '    public Task<OrderCreated> Handle(CreateOrder request, CancellationToken ct)',
      '        => Task.FromResult(new OrderCreated(Guid.NewGuid(), request.Number));',
      '}',
      '',
      '// Inject ISender where code only dispatches requests',
      'OrderCreated created = await sender.Send(new CreateOrder("ORD-1042"), ct);',
    ],
    stages: [
      {
        label: 'Declare',
        subLabel: 'Define intent',
        role: 'CONTRACT',
        heading: 'Declare the request and response contract',
        explanation:
          'A typed IRequest<OrderCreated> record states the input and single response type up front without coupling domain contracts to a DI container.',
        apiSymbol: 'IRequest<OrderCreated>',
        highlightLines: [3, 4],
      },
      {
        label: 'Compose',
        subLabel: 'Wire pipeline',
        role: 'DECISION',
        heading: 'Register handlers and ordered behaviors explicitly',
        explanation:
          'Assembly-marker registration connects handlers while IPipelineBehavior<,> wrappers execute deterministically in dependency-injection order.',
        apiSymbol: 'AddAstraFlowMediator(...)',
        highlightLines: [6, 9],
      },
      {
        label: 'Handle',
        subLabel: 'Execute logic',
        role: 'IMPLEMENTATION',
        heading: 'Resolve one concrete handler per request',
        explanation:
          'AstraFlow enforces a single handler per request contract, failing clearly on missing or duplicate registrations instead of silently picking one.',
        apiSymbol: 'IRequestHandler<TReq, TRes>',
        highlightLines: [11, 15],
      },
      {
        label: 'Result',
        subLabel: 'Return response',
        role: 'RESULT',
        heading: 'Dispatch through the narrowest sender interface',
        explanation:
          'Callers depend on ISender rather than the full IMediator surface and await the strongly typed OrderCreated result with cancellation propagation.',
        apiSymbol: 'ISender.Send(...)',
        highlightLines: [17, 18],
      },
    ],
  },
  mapping: {
    id: 'mapping',
    indexLabel: '02',
    shortTab: 'Object Mapping',
    packageId: 'AstraFlow.Mapper',
    packageVersion: '2.3.0',
    docHref: '/docs/mapper',
    docLabel: 'Mapper guide',
    headline: 'Mapping is an explicit decision.',
    fileName: 'Customers/CustomerMappingRule.cs',
    codeLines: [
      'using AstraFlow.Mapper;',
      '',
      'public sealed record Customer(Guid Id, string Name, string InternalNote);',
      'public sealed record CustomerResponse(Guid Id, string Name);',
      '',
      'public sealed class CustomerMappingRule : IDeclaredObjectMappingRule',
      '{',
      '    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =',
      '        [ObjectMappingPair.Create<Customer, CustomerResponse>()];',
      '',
      '    public bool CanMap(Type src, Type dst) =>',
      '        src == typeof(Customer) && dst == typeof(CustomerResponse);',
      '',
      '    public object? Map(object? source, Type dst, IMapper mapper) =>',
      '        source is Customer c ? new CustomerResponse(c.Id, c.Name) : null;',
      '}',
      '',
      'services.AddAstraFlowMapper(typeof(CustomerMappingRule));',
      'var dto = mapper.Map<CustomerResponse>(customer);',
    ],
    stages: [
      {
        label: 'Declare',
        subLabel: 'Separate shapes',
        role: 'CONTRACT',
        heading: 'Keep source entities and destination DTOs distinct',
        explanation:
          'InternalNote stays on the Customer domain shape. Nothing maps by implicit naming unless an explicit rule or opt-in convention pair permits it.',
        apiSymbol: 'Customer -> CustomerResponse',
        highlightLines: [3, 4],
      },
      {
        label: 'Compose',
        subLabel: 'Declare pairs',
        role: 'DECISION',
        heading: 'Advertise supported pairs via IDeclaredObjectMappingRule',
        explanation:
          'ObjectMappingPair.Create<TSource, TDestination>() declares exact ownership so startup validation can catch drift or duplicate pair claims.',
        apiSymbol: 'IDeclaredObjectMappingRule',
        highlightLines: [6, 12],
      },
      {
        label: 'Handle',
        subLabel: 'Transform fields',
        role: 'IMPLEMENTATION',
        heading: 'Run explicit member construction inside Map(...)',
        explanation:
          'The owning rule builds CustomerResponse deterministically, leaving InternalNote uncopied and keeping mapping behavior reviewable in plain C#.',
        apiSymbol: 'ObjectMappingPair.Create<,>()',
        highlightLines: [14, 16],
      },
      {
        label: 'Result',
        subLabel: 'Validate & map',
        role: 'RESULT',
        heading: 'Validate rule ownership at startup and map safely',
        explanation:
          'AddAstraFlowMapper validates the declared catalog at startup before mapper.Map<CustomerResponse>(customer) produces the DTO.',
        apiSymbol: 'IMapper.Map<CustomerResponse>()',
        highlightLines: [18, 19],
      },
    ],
  },
  diagnostics: {
    id: 'diagnostics',
    indexLabel: '03',
    shortTab: 'Diagnostics',
    packageId: 'AstraFlow.Diagnostics',
    packageVersion: '2.3.0',
    docHref: '/docs/diagnostics',
    docLabel: 'Diagnostics guide',
    headline: 'What is knowable, visible.',
    fileName: 'Diagnostics/RegistrationAudit.cs',
    codeLines: [
      'using AstraFlow.Diagnostics;',
      '',
      'services.AddAstraFlowMediator(typeof(CreateOrder));',
      'services.AddAstraFlowMapper(typeof(CustomerMappingRule));',
      '',
      'services.AddAstraFlowDiagnostics(options =>',
      '{',
      '    options.AssemblyMarkerTypes.Add(typeof(CreateOrder));',
      '    options.ValidateRequestCoverage = true;',
      '});',
      '',
      'var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();',
      'AstraFlowDiagnosticReport report = reporter.CreateReport();',
      '',
      'string markdown = reporter.CreateMarkdownReport();',
      'if (report.Summary.HasErrors) throw new InvalidOperationException(markdown);',
    ],
    stages: [
      {
        label: 'Declare',
        subLabel: 'Register graph',
        role: 'CONTRACT',
        heading: 'Capture DI registrations after services are declared',
        explanation:
          'Diagnostics snapshots the active service collection in exact DI registration order so pipeline and notification ordering stays inspectable.',
        apiSymbol: 'ServiceDescriptor Snapshot',
        highlightLines: [3, 4],
      },
      {
        label: 'Compose',
        subLabel: 'Set audit rules',
        role: 'DECISION',
        heading: 'Configure assembly markers and coverage validation',
        explanation:
          'AddAstraFlowDiagnostics enables request-coverage and mapping-catalog checks while keeping payloads, tokens, and DTO values untouched.',
        apiSymbol: 'AddAstraFlowDiagnostics(...)',
        highlightLines: [6, 10],
      },
      {
        label: 'Handle',
        subLabel: 'Build report',
        role: 'IMPLEMENTATION',
        heading: 'Evaluate findings into a deterministic report model',
        explanation:
          'IAstraFlowDiagnosticsReporter evaluates registrations and emits stable AFD* and AFP* severity-coded findings without ASP.NET Core coupling.',
        apiSymbol: 'IAstraFlowDiagnosticsReporter',
        highlightLines: [12, 13],
      },
      {
        label: 'Result',
        subLabel: 'Export or gate',
        role: 'RESULT',
        heading: 'Emit Markdown or JSON and gate on Summary.HasErrors',
        explanation:
          'Surface actionable Markdown reports in local development or fail CI startup gates cleanly when Summary.HasErrors is true.',
        apiSymbol: 'report.Summary.HasErrors',
        highlightLines: [15, 16],
      },
    ],
  },
  testing: {
    id: 'testing',
    indexLabel: '04',
    shortTab: 'Testing Harnesses',
    packageId: 'AstraFlow.Testing',
    packageVersion: '2.3.0',
    docHref: '/docs/testing',
    docLabel: 'Testing guide',
    headline: 'Verify handlers without guesswork.',
    fileName: 'Tests/OrderFlowTests.cs',
    codeLines: [
      'using AstraFlow.Testing;',
      '',
      'var mediator = new FakeMediator()',
      '    .RespondWith<CreateOrder, OrderCreated>(new OrderCreated(orderId, "ORD-1042"));',
      '',
      'var harness = new PipelineTestHarness<CreateOrder, OrderCreated>(',
      '    new IPipelineBehavior<CreateOrder, OrderCreated>[] { loggingBehavior },',
      '    (request, token) => handler.Handle(request, token));',
      '',
      'OrderCreated handled = await harness.Execute(new CreateOrder("ORD-1042"), ct);',
      'OrderCreated stubbed = await mediator.Send(new CreateOrder("ORD-1042"), ct);',
      '',
      'mediator.Requests.SingleSent<CreateOrder>();',
      'report.ShouldHaveNoDiagnosticErrors();',
    ],
    stages: [
      {
        label: 'Declare',
        subLabel: 'Stub responses',
        role: 'CONTRACT',
        heading: 'Configure explicit responses on runner-neutral fakes',
        explanation:
          'FakeMediator throws clearly if an unconfigured request is sent, preventing tests from silently passing against unverified collaborators.',
        apiSymbol: 'FakeMediator.RespondWith<,>()',
        highlightLines: [3, 4],
      },
      {
        label: 'Compose',
        subLabel: 'Assemble harness',
        role: 'DECISION',
        heading: 'Bind exact pipeline behaviors into PipelineTestHarness',
        explanation:
          'Test behavior ordering, short-circuiting, and exception recovery directly without bootstrapping a full DI container or mocking framework.',
        apiSymbol: 'PipelineTestHarness<,>',
        highlightLines: [6, 8],
      },
      {
        label: 'Handle',
        subLabel: 'Run scenario',
        role: 'IMPLEMENTATION',
        heading: 'Execute the isolated pipeline and fake sender',
        explanation:
          'Invoke harness.Execute(...) or FakeMediator.Send(...) across xUnit, NUnit, or MSTest with zero test-runner dependency coupling.',
        apiSymbol: 'harness.Execute(...)',
        highlightLines: [10, 11],
      },
      {
        label: 'Result',
        subLabel: 'Assert contracts',
        role: 'RESULT',
        heading: 'Verify dispatched messages and clean diagnostic reports',
        explanation:
          'Confirm SingleSent<CreateOrder>() and ShouldHaveNoDiagnosticErrors() using AstraFlow.Testing (published 2.3.0 on NuGet).',
        apiSymbol: 'ShouldHaveNoDiagnosticErrors()',
        highlightLines: [13, 14],
      },
    ],
  },
};

const CAPABILITY_ORDER: readonly FlowCapabilityId[] = [
  'dispatch',
  'mapping',
  'diagnostics',
  'testing',
];

const ROLE_RAIL_ITEMS: readonly FlowStageRole[] = [
  'CONTRACT',
  'DECISION',
  'IMPLEMENTATION',
  'RESULT',
];

function createInitialState(capability: FlowCapabilityId): FlowAtlasState {
  const spec = CAPABILITIES[capability];
  return {
    capability: spec.id,
    stage: 0,
    packageId: spec.packageId,
    packageVersion: spec.packageVersion,
    docHref: spec.docHref,
    pulsePaused: false,
    copyStatus: 'idle',
  } as FlowAtlasState;
}

function reduceFlowAtlasState(
  state: FlowAtlasState,
  action: FlowAtlasAction,
): FlowAtlasState {
  switch (action.type) {
    case 'SELECT_CAPABILITY': {
      const spec = CAPABILITIES[action.capability];
      return {
        capability: spec.id,
        stage: 0,
        packageId: spec.packageId,
        packageVersion: spec.packageVersion,
        docHref: spec.docHref,
        pulsePaused: state.pulsePaused,
        copyStatus: 'idle',
      } as FlowAtlasState;
    }
    case 'SELECT_STAGE':
      return {
        ...state,
        stage: action.stage,
        copyStatus: 'idle',
      };
    case 'SET_COPY_STATUS':
      return {
        ...state,
        copyStatus: action.status,
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Pure JSX C# syntax tokenizer (Warm Forest tokens, zero innerHTML injection) */
/* -------------------------------------------------------------------------- */

const CSHARP_TOKEN_PATTERN =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|(\b(?:using|public|sealed|record|class|bool|object|var|new|if|throw|await|true|false|null)\b)|(\b[A-Z][A-Za-z0-9_]*\b)/g;

function renderHighlightedCSharpLine(line: string): ReactNode {
  if (!line) {
    return ' ';
  }
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  CSHARP_TOKEN_PATTERN.lastIndex = 0;
  let match = CSHARP_TOKEN_PATTERN.exec(line);
  let keyCounter = 0;

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    let className = '';
    if (match[1]) className = 'tok-cm';
    else if (match[2]) className = 'tok-str';
    else if (match[3]) className = 'tok-num';
    else if (match[4]) className = 'tok-kw';
    else if (match[5]) className = 'tok-ty';

    nodes.push(
      className ? (
        <span key={keyCounter++} className={className}>
          {token}
        </span>
      ) : (
        token
      ),
    );

    lastIndex = match.index + token.length;
    match = CSHARP_TOKEN_PATTERN.exec(line);
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return nodes;
}

/* -------------------------------------------------------------------------- */
/* Isometric Hairline geometry for the 4-plinth signal path                   */
/* -------------------------------------------------------------------------- */

interface StagePlinthGeom {
  readonly index: FlowStageIndex;
  readonly baseShadow: IsoPlateGeometry;
  readonly mainPlate: IsoPlateGeometry;
  readonly activeCap: IsoPlateGeometry;
  readonly topCenter: Point2;
  readonly dockPoint: Point2;
  readonly iconMarkup: string[];
}

interface AtlasSceneGeometry {
  readonly viewBox: string;
  readonly gridLines: readonly string[];
  readonly plinths: readonly StagePlinthGeom[];
  readonly conduitPoints: readonly Point2[];
  readonly stageProgressFractions: readonly [number, number, number, number];
}

function buildAtlasSceneGeometry(): AtlasSceneGeometry {
  const centersT = [-156, -52, 52, 156] as const;
  const halfSize = 33;
  const cradlePad = 6;

  // Include most extreme lifted pose in fitCamera bounds (Rule 03)
  const fitPts: Point3[] = [
    [-212, 212, 0],
    [212, -212, 0],
    [-195, 195, 28],
    [195, -195, 28],
    [0, 48, -4],
    [0, -48, 28],
  ];
  const camera = fitCamera(createCamera(45, 0.5, 1.4), fitPts, 440, 126);
  const P = projectCamera(camera);

  // Subtle architectural isometric drafting lines centered along the (t, -t) corridor
  const gridLines: string[] = [];
  for (let t = -208; t <= 208; t += 52) {
    gridLines.push(open([P(t - 52, -t - 52, -3), P(t + 52, -t + 52, -3)]));
  }
  for (let d = -48; d <= 48; d += 24) {
    gridLines.push(open([P(-208 + d, 208 + d, -3), P(208 + d, -208 + d, -3)]));
  }

  const conduitPoints: Point2[] = [P(-208, 208, 1)];
  const dockWaypointIndices: number[] = [];

  const plinths: StagePlinthGeom[] = centersT.map((t, idx) => {
    const cx = t;
    const cy = -t;
    const x0 = cx - halfSize;
    const x1 = cx + halfSize;
    const y0 = cy - halfSize;
    const y1 = cy + halfSize;

    const baseShadow = createIsoPlateGeometry({
      camera,
      x0: x0 - 2,
      y0: y0 - 2,
      x1: x1 + 2,
      y1: y1 + 2,
      z0: -3,
      z1: -0.5,
      radius: 7,
      creaseInset: 0,
      steps: 8,
    });

    const mainPlate = createIsoPlateGeometry({
      camera,
      x0,
      y0,
      x1,
      y1,
      z0: 0,
      z1: 8.5,
      radius: 7,
      creaseInset: 2.2,
      steps: 10,
    });

    const activeCap = createIsoPlateGeometry({
      camera,
      x0: x0 + 5,
      y0: y0 + 5,
      x1: x1 - 5,
      y1: y1 - 5,
      z0: 10,
      z1: 15,
      radius: 5,
      creaseInset: 1.6,
      steps: 8,
    });

    // Front-perimeter routing along visible bevel so pulse dot is never hidden behind resting plinths
    const leftPort = P(x0 - cradlePad, y1 + cradlePad, 1);
    const frontDock = P(x1 + cradlePad, y1 + cradlePad, 1);
    const rightPort = P(x1 + cradlePad, y0 - cradlePad, 1);

    conduitPoints.push(leftPort);
    dockWaypointIndices.push(conduitPoints.length);
    conduitPoints.push(frontDock);
    conduitPoints.push(rightPort);

    if (idx < centersT.length - 1) {
      const bridgeMid = P(t + 52, -(t + 52), 12);
      conduitPoints.push(bridgeMid);
    }

    // Isometric in-plane geometric motifs projected onto top face (z = 8.6)
    const iconZ = 8.7;
    let iconMarkup: string[];
    if (idx === 0) {
      // Contract frame + inner prompt bracket
      iconMarkup = [
        poly([
          P(cx - 12, cy - 12, iconZ),
          P(cx + 12, cy - 12, iconZ),
          P(cx + 12, cy + 12, iconZ),
          P(cx - 12, cy + 12, iconZ),
        ]),
        open([
          P(cx - 5, cy + 5, iconZ),
          P(cx - 5, cy - 5, iconZ),
          P(cx + 5, cy - 5, iconZ),
        ]),
      ];
    } else if (idx === 1) {
      // Composed concentric rings / pipeline layers
      iconMarkup = [
        poly([
          P(cx - 13, cy - 13, iconZ),
          P(cx + 13, cy - 13, iconZ),
          P(cx + 13, cy + 13, iconZ),
          P(cx - 13, cy + 13, iconZ),
        ]),
        poly([
          P(cx - 6, cy - 6, iconZ),
          P(cx + 6, cy - 6, iconZ),
          P(cx + 6, cy + 6, iconZ),
          P(cx - 6, cy + 6, iconZ),
        ]),
      ];
    } else if (idx === 2) {
      // Active execution diamond + crosshair axes
      iconMarkup = [
        poly([
          P(cx, cy - 13, iconZ),
          P(cx + 13, cy, iconZ),
          P(cx, cy + 13, iconZ),
          P(cx - 13, cy, iconZ),
        ]),
        open([P(cx - 10, cy, iconZ), P(cx + 10, cy, iconZ)]),
        open([P(cx, cy - 10, iconZ), P(cx, cy + 10, iconZ)]),
      ];
    } else {
      // Verified checkmark in isometric plane
      iconMarkup = [
        open([
          P(cx - 10, cy + 1, iconZ),
          P(cx - 2, cy + 9, iconZ),
          P(cx + 12, cy - 9, iconZ),
        ]),
      ];
    }

    return {
      index: idx as FlowStageIndex,
      baseShadow,
      mainPlate,
      activeCap,
      topCenter: mainPlate.topCenter,
      dockPoint: frontDock,
      iconMarkup,
    };
  });

  conduitPoints.push(P(208, -208, 1));

  // Compute cumulative Euclidean distance fractions so trace stops cleanly at active stage dock
  const cumulative: number[] = [0];
  let total = 0;
  for (let i = 1; i < conduitPoints.length; i++) {
    const prev = conduitPoints[i - 1];
    const curr = conduitPoints[i];
    total += Math.hypot(curr[0] - prev[0], curr[1] - prev[1]);
    cumulative.push(total);
  }

  const safeTotal = total > 0 ? total : 1;
  const stageProgressFractions: [number, number, number, number] = [
    cumulative[dockWaypointIndices[0]] / safeTotal,
    cumulative[dockWaypointIndices[1]] / safeTotal,
    cumulative[dockWaypointIndices[2]] / safeTotal,
    1,
  ];

  return {
    viewBox: '0 0 880 232',
    gridLines,
    plinths,
    conduitPoints,
    stageProgressFractions,
  };
}

export interface LivingFlowAtlasProps {
  readonly initialCapability?: FlowCapabilityId;
  readonly className?: string;
}

/**
 * Interactive dark-forest Living Flow Atlas (`#experience`).
 * Replaces the boxed 3-column `.flow-device` dashboard with an open Hairline-projected
 * 4-plinth isometric path, Signal Orange conduit pulse, and synchronized line-highlighted C# inspector.
 */
export function LivingFlowAtlas({
  initialCapability = 'dispatch',
  className,
}: LivingFlowAtlasProps) {
  const [state, dispatch] = useReducer(
    reduceFlowAtlasState,
    initialCapability,
    createInitialState,
  );
  const [hoveredStage, setHoveredStage] = useState<FlowStageIndex | null>(null);
  const [copyAnnouncement, setCopyAnnouncement] = useState('');

  const sectionRef = useRef<HTMLElement | null>(null);
  const capTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stageTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const copyTimerRef = useRef<number | null>(null);

  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(sectionRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const sceneGeom = useMemo(() => buildAtlasSceneGeometry(), []);
  const spec = CAPABILITIES[state.capability];
  const stageSpec = spec.stages[state.stage];

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const selectCapability = (capability: FlowCapabilityId) => {
    dispatch({ type: 'SELECT_CAPABILITY', capability });
  };

  const selectStage = (stage: FlowStageIndex) => {
    dispatch({ type: 'SELECT_STAGE', stage });
  };

  const handleCapabilityKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentIndex = CAPABILITY_ORDER.indexOf(state.capability);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? CAPABILITY_ORDER.length - 1
          : event.key === 'ArrowRight'
            ? (currentIndex + 1) % CAPABILITY_ORDER.length
            : (currentIndex - 1 + CAPABILITY_ORDER.length) % CAPABILITY_ORDER.length;
    const nextCap = CAPABILITY_ORDER[nextIndex];
    selectCapability(nextCap);
    capTabRefs.current[nextIndex]?.focus();
  };

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const nextStage = (
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 3
          : event.key === 'ArrowRight'
            ? Math.min(3, state.stage + 1)
            : Math.max(0, state.stage - 1)
    ) as FlowStageIndex;
    selectStage(nextStage);
    stageTabRefs.current[nextStage]?.focus();
  };

  const handleCopyCode = async () => {
    const text = spec.codeLines.join('\n');
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(text);
      dispatch({ type: 'SET_COPY_STATUS', status: 'copied' });
      setCopyAnnouncement('Copied to clipboard');
    } catch {
      dispatch({ type: 'SET_COPY_STATUS', status: 'fallback' });
      setCopyAnnouncement('Clipboard unavailable; select code block to copy');
    }
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      dispatch({ type: 'SET_COPY_STATUS', status: 'idle' });
      setCopyAnnouncement('');
    }, 2000);
  };

  const activeTabId = `flow-cap-tab-${state.capability}`;
  const activeStageTabId = `flow-stage-tab-${state.stage}`;
  const conduitProgress = sceneGeom.stageProgressFractions[state.stage];
  const isPulsePaused = reducedMotion || !viewportActive;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="flow-atlas-heading"
      className={className ? `${styles.section} ${className}` : styles.section}
      id="experience"
    >
      <div className={styles.inner}>
        <div className={styles.intro} data-reveal="up">
          <div>
            <p className={styles.eyebrow}>02 / FOLLOW THE ENGINE</p>
            <h2 id="flow-atlas-heading" className={styles.heading}>
              The whole path.
              <br />
              <span className={styles.headingAccent}>In plain sight.</span>
            </h2>
          </div>
          <div className={styles.caption}>
            <div aria-hidden="true" className={styles.captionGlyph}>
              {'{ }'}
            </div>
            <p className={styles.captionText}>
              Walk through a documented AstraFlow capability. Switch flows,
              select any stage plinth, and inspect the synchronized C# lines.{' '}
              <strong className={styles.captionStrong}>
                Conceptual shapes grounded in verified 2.3.0 packages.
              </strong>
            </p>
          </div>
        </div>

        <div className={styles.provenanceBar} role="note">
          <span className={styles.provenanceCopy}>
            <span aria-hidden="true" className={styles.provenanceDot} />
            Guided API illustration — conceptual source shapes, not live runtime telemetry
          </span>
          <div className={styles.provenanceRight}>
            <span className={styles.provenanceMeta}>
              {spec.packageId} · {spec.packageVersion}
            </span>
            <span className={styles.signalLivePill}>
              <span aria-hidden="true" className={styles.signalLiveDot} />
              SIGNAL LIVE
            </span>
          </div>
        </div>

        <div className={styles.capabilityBar}>
          <div
            role="tablist"
            aria-label="Documented AstraFlow capabilities"
            className={styles.capabilityTabs}
            onKeyDown={handleCapabilityKeyDown}
          >
            {CAPABILITY_ORDER.map((capId, idx) => {
              const item = CAPABILITIES[capId];
              const isSelected = state.capability === capId;
              return (
                <button
                  key={capId}
                  id={`flow-cap-tab-${capId}`}
                  ref={(el) => {
                    capTabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="flow-atlas-panel"
                  tabIndex={isSelected ? 0 : -1}
                  className={styles.capabilityTab}
                  onClick={() => selectCapability(capId)}
                >
                  <span className={styles.capIndex}>
                    {item.indexLabel} · CAPABILITY
                  </span>
                  <span className={styles.capTitle}>{item.shortTab}</span>
                  <span className={styles.capPkg}>{item.packageId}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.capabilityHeadlineWrap}>
            <h3 className={styles.capabilityHeadline}>{spec.headline}</h3>
            <Link className={styles.capabilityDocLink} href={spec.docHref}>
              Read {spec.docLabel} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div
          id="flow-atlas-panel"
          role="tabpanel"
          aria-labelledby={activeTabId}
          className={styles.atlasCanvas}
        >
          <div className={styles.atlasSvgWrap}>
            <svg
              aria-label={`${spec.shortTab} four-stage isometric request path: ${spec.stages.map((s) => s.label).join(' to ')}`}
              className={styles.atlasSvg}
              viewBox={sceneGeom.viewBox}
            >
              {/* Subtle drafting ground grid behind plinths */}
              <g aria-hidden="true" fill="none" stroke="#16463a" strokeWidth={0.85} opacity={0.75}>
                {sceneGeom.gridLines.map((d, i) => (
                  <path key={i} d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </g>

              {/* Resting plinth footprints & docking terminal sockets */}
              <g aria-hidden="true">
                {sceneGeom.plinths.map((plinth) => {
                  const reached = plinth.index <= state.stage;
                  return (
                    <g key={`shadow-${plinth.index}`}>
                      <path
                        d={plinth.baseShadow.silPath}
                        fill="#031712"
                        stroke="#194a3d"
                        strokeWidth={0.9}
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle
                        cx={r2(plinth.dockPoint[0])}
                        cy={r2(plinth.dockPoint[1])}
                        r={3.2}
                        fill={
                          reached
                            ? WARM_FOREST_PALETTE.signal
                            : '#0a342b'
                        }
                        stroke={
                          reached
                            ? WARM_FOREST_PALETTE.peach
                            : '#2f5b4e'
                        }
                        strokeWidth={1.1}
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  );
                })}
              </g>

              {/* Continuous Signal Orange isometric conduit connecting all 4 plinths */}
              <IsoSignalConduit
                points={sceneGeom.conduitPoints}
                cornerRadius={11}
                surface="forest"
                active
                progress={conduitProgress}
                paused={isPulsePaused}
                viewportActive={viewportActive}
                dashArray="2.5 4.5"
                baseColor="#2b6150"
                signalColor={WARM_FOREST_PALETTE.signal}
                baseStrokeWidth={1.15}
                activeStrokeWidth={1.85}
                pulseRadius={2.9}
                pulseDurationMs={2400}
                showTerminals
                transitionMs={680}
              />

              {/* 4 interactive Hairline rounded-hull isometric stage plinths */}
              {sceneGeom.plinths.map((plinth, idx) => {
                const isSelected = state.stage === plinth.index;
                const isHovered = hoveredStage === plinth.index;
                const isReached = plinth.index <= state.stage;
                const stageInfo = spec.stages[plinth.index];
                const liftPx = isSelected ? 14 : isHovered ? 5 : 0;
                const delayMs = staggerDelayMs(idx, state.stage, 45);

                return (
                  <g key={`plinth-${plinth.index}`}>
                    <IsoPrism
                      geometry={plinth.mainPlate}
                      variant={isSelected ? 'forest' : 'dark-forest'}
                      active={isHovered || isReached}
                      selected={isSelected}
                      liftPx={liftPx}
                      delayMs={delayMs}
                      showDropGuides={isSelected || isHovered}
                      strokeWidth={1.15}
                      activeStrokeWidth={isSelected ? 1.85 : 1.35}
                      role="button"
                      tabIndex={-1}
                      label={`Stage 0${plinth.index + 1}: ${stageInfo.label} (${stageInfo.role})`}
                      ariaPressed={isSelected}
                      onSelect={() => selectStage(plinth.index)}
                      onHoverChange={(hover) =>
                        setHoveredStage(hover ? plinth.index : null)
                      }
                    >
                      {/* Elevated secondary accent cap when stage is selected */}
                      {isSelected ? (
                        <g aria-hidden="true">
                          <path
                            d={plinth.activeCap.silPath}
                            fill={WARM_FOREST_PALETTE.action}
                            stroke={WARM_FOREST_PALETTE.peach}
                            strokeWidth={1.25}
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          {plinth.activeCap.creasePath ? (
                            <path
                              d={plinth.activeCap.creasePath}
                              fill="none"
                              stroke={WARM_FOREST_PALETTE.signal}
                              strokeWidth={0.9}
                              vectorEffect="non-scaling-stroke"
                            />
                          ) : null}
                        </g>
                      ) : (
                        <g
                          aria-hidden="true"
                          fill="none"
                          stroke={
                            isReached
                              ? WARM_FOREST_PALETTE.peach
                              : '#6d9b87'
                          }
                          strokeWidth={1.15}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {plinth.iconMarkup.map((d, iconIdx) => (
                            <path
                              key={iconIdx}
                              d={d}
                              vectorEffect="non-scaling-stroke"
                            />
                          ))}
                        </g>
                      )}

                      {/* Crisp station badge anchored above top center */}
                      <text
                        x={r2(plinth.topCenter[0])}
                        y={r2(plinth.topCenter[1] - (isSelected ? 19 : 14))}
                        textAnchor="middle"
                        fill={
                          isSelected
                            ? WARM_FOREST_PALETTE.peach
                            : isReached
                              ? '#e8f5ee'
                              : '#9cc1ae'
                        }
                        fontFamily="var(--font-mono)"
                        fontSize={12}
                        fontWeight={700}
                        letterSpacing="0.08em"
                      >
                        {`0${plinth.index + 1}`}
                      </text>
                    </IsoPrism>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            role="tablist"
            aria-label={`${spec.shortTab} stages`}
            className={styles.stageRail}
            onKeyDown={handleStageKeyDown}
          >
            {spec.stages.map((item, idx) => {
              const stageIdx = idx as FlowStageIndex;
              const isSelected = state.stage === stageIdx;
              const isReached = stageIdx <= state.stage;
              return (
                <button
                  key={item.label}
                  id={`flow-stage-tab-${stageIdx}`}
                  ref={(el) => {
                    stageTabRefs.current[stageIdx] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="flow-stage-inspector"
                  tabIndex={isSelected ? 0 : -1}
                  data-reached={isReached ? 'true' : 'false'}
                  data-stage={stageIdx}
                  className={styles.stageButton}
                  onClick={() => selectStage(stageIdx)}
                >
                  <span className={styles.stageButtonTop}>
                    <span className={styles.stageNum}>{`0${idx + 1}`}</span>
                    <span className={styles.stageRoleTiny}>{item.role}</span>
                  </span>
                  <span className={styles.stageName}>{item.label}</span>
                  <span className={styles.stageSub}>{item.subLabel}</span>
                </button>
              );
            })}
          </div>

          <div
            id="flow-stage-inspector"
            role="tabpanel"
            aria-labelledby={activeStageTabId}
            className={styles.inspectorGrid}
          >
            <div className={styles.decisionCol}>
              <div className={styles.decisionReadout}>
                <div className={styles.decisionHeader}>
                  <span className={styles.decisionCounter}>
                    <span aria-hidden="true" className={styles.liveDot} />
                    {`0${state.stage + 1} OF 04`}
                  </span>
                  <span className={styles.roleBadge}>{stageSpec.role}</span>
                </div>

                <h4 className={styles.decisionTitle}>{stageSpec.heading}</h4>
                <p className={styles.decisionBody}>{stageSpec.explanation}</p>

                <div className={styles.metaPills}>
                  <Link className={styles.packagePill} href="/packages#directory">
                    <span>{spec.packageId}</span>
                    <span className={styles.packageVer}>
                      {spec.packageVersion}
                    </span>
                  </Link>
                  <code className={styles.symbolPill}>{stageSpec.apiSymbol}</code>
                </div>
              </div>

              <div className={styles.stageNavActions}>
                <button
                  type="button"
                  className={styles.navBtnSecondary}
                  disabled={state.stage === 0}
                  onClick={() =>
                    selectStage(Math.max(0, state.stage - 1) as FlowStageIndex)
                  }
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className={styles.navBtnPrimary}
                  onClick={() =>
                    selectStage(
                      (state.stage === 3 ? 0 : state.stage + 1) as FlowStageIndex,
                    )
                  }
                >
                  {state.stage === 3 ? 'Restart ↺' : 'Next step →'}
                </button>
              </div>
            </div>

            <div className={styles.codeInspector}>
              <div className={styles.codeTopbar}>
                <div className={styles.codeTitleGroup}>
                  <span className={styles.frameDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.codeFilename}>{spec.fileName}</span>
                  <span className={styles.codeRangeBadge}>
                    {`Lines ${stageSpec.highlightLines[0]}–${stageSpec.highlightLines[1]}`}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.copyButton}
                  data-status={state.copyStatus}
                  aria-label={
                    state.copyStatus === 'copied'
                      ? 'Copied C# example'
                      : state.copyStatus === 'fallback'
                        ? 'Copy unavailable'
                        : `Copy example: ${spec.fileName} C#`
                  }
                  onClick={handleCopyCode}
                >
                  {state.copyStatus === 'copied'
                    ? 'Copied ✓'
                    : state.copyStatus === 'fallback'
                      ? 'Copy unavailable'
                      : 'Copy example'}
                </button>
              </div>

              <div
                className={styles.codeScroll}
                tabIndex={0}
                role="region"
                aria-label={`${spec.fileName} C# example viewport`}
              >
                <ol
                  className={styles.codeLines}
                  aria-label={`${spec.fileName} C# example`}
                >
                  {spec.codeLines.map((lineText, idx) => {
                    const lineNumber = idx + 1;
                    const isHighlighted =
                      lineNumber >= stageSpec.highlightLines[0] &&
                      lineNumber <= stageSpec.highlightLines[1];
                    return (
                      <li
                        key={lineNumber}
                        className={styles.codeLine}
                        data-active-line={isHighlighted ? 'true' : 'false'}
                      >
                        <span className={styles.lineNum} aria-hidden="true">
                          {String(lineNumber).padStart(2, '0')}
                        </span>
                        <code className={styles.lineContent}>
                          {renderHighlightedCSharpLine(lineText)}
                        </code>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <span className={styles.srOnly} role="status" aria-live="polite">
                {copyAnnouncement}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.technicalRail} aria-hidden="true">
          {ROLE_RAIL_ITEMS.map((role, idx) => (
            <div key={role} style={{ display: 'contents' }}>
              <span
                className={styles.technicalRailStep}
                data-active={stageSpec.role === role ? 'true' : 'false'}
              >
                {role}
              </span>
              {idx < ROLE_RAIL_ITEMS.length - 1 ? (
                <i className={styles.technicalRailDivider} />
              ) : null}
            </div>
          ))}
        </div>

        <div className={styles.outro}>
          <p>
            Every stage represents a documented responsibility, not measured
            execution timing.
          </p>
          <Link className={styles.outroLink} href="/docs/getting-started">
            Read the getting started guide <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
