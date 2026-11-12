"use client";

import React, { useReducer, useId, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

export type FlowScenario = "dispatch" | "mapping" | "diagnostics";
export type FlowStageIndex = 0 | 1 | 2 | 3;

interface StageInfo {
  tag: string;
  title: string;
  sub: string;
  csharpType: string;
  csharpSummary: string;
  codeSnippet: string;
  activeLines: number[];
}

interface ScenarioData {
  id: FlowScenario;
  label: string;
  badge: string;
  stages: [StageInfo, StageInfo, StageInfo, StageInfo];
}

const SCENARIOS: Record<FlowScenario, ScenarioData> = {
  dispatch: {
    id: "dispatch",
    label: "Mediator Pipeline",
    badge: "AstraFlow.Mediator",
    stages: [
      {
        tag: "01 / DECLARE",
        title: "Request Contract",
        sub: "Explicit IRequest<T> record with immutable payload",
        csharpType: "public sealed record CreateOrder(string OrderId, decimal Amount) : IRequest<OrderResult>;",
        csharpSummary: "Clean message contract without service locator or reflection leaks.",
        codeSnippet: `// 1. Declare explicit typed request contract
public sealed record CreateOrder(
    string OrderId,
    decimal Amount,
    CustomerId Customer
) : IRequest<OrderResult>;

// 2. Strongly typed response outcome
public sealed record OrderResult(
    string OrderId,
    OrderStatus Status,
    DateTimeOffset CreatedAtUtc
);`,
        activeLines: [2, 3, 4, 5, 6],
      },
      {
        tag: "02 / INTERCEPT",
        title: "Pipeline Behaviors",
        sub: "Deterministic pre/post middleware without global hooks",
        csharpType: "IPipelineBehavior<TRequest, TResponse> in DI registration order",
        csharpSummary: "Validation, logging, and metrics compose predictably in explicit chain order.",
        codeSnippet: `// Composed pipeline behavior in explicit order
public sealed class ValidationBehavior<TReq, TRes>(
    IValidator<TReq>? validator = null
) : IPipelineBehavior<TReq, TRes> where TReq : notnull
{
    public async Task<TRes> Handle(
        TReq request, 
        RequestHandlerDelegate<TRes> next, 
        CancellationToken ct)
    {
        if (validator is not null) 
            await validator.ValidateAndThrowAsync(request, ct);
        return await next();
    }
}`,
        activeLines: [2, 9, 13, 14, 15],
      },
      {
        tag: "03 / EXECUTE",
        title: "Handler Dispatch",
        sub: "Direct single-handler invocation with zero overhead",
        csharpType: "IRequestHandler<CreateOrder, OrderResult>.Handle(request, ct)",
        csharpSummary: "Zero reflection lookup at runtime; dispatch routed via compiled delegate table.",
        codeSnippet: `// Explicit handler implementation - zero runtime reflection
public sealed class CreateOrderHandler(
    IOrderRepository orders,
    TimeProvider clock
) : IRequestHandler<CreateOrder, OrderResult>
{
    public async Task<OrderResult> Handle(
        CreateOrder request, 
        CancellationToken ct)
    {
        var entity = new OrderEntity(request.OrderId, request.Amount);
        await orders.SaveAsync(entity, ct);
        return new OrderResult(entity.Id, OrderStatus.Confirmed, clock.GetUtcNow());
    }
}`,
        activeLines: [5, 9, 12, 13, 14],
      },
      {
        tag: "04 / RESULT",
        title: "Typed Outcome & Evidence",
        sub: "Predictable completion with OpenTelemetry propagation",
        csharpType: "OrderResult payload with trace context & zero allocation overhead",
        csharpSummary: "Activity span closes automatically with duration, status code, and payload safety.",
        codeSnippet: `// Call site - clean, strongly typed, inspectable
var result = await sender.Send(
    new CreateOrder("ORD-2026-901", 185.50m, customer), 
    cancellationToken
);

// Inspectable trace outcome:
// astraflow.mediator.dispatch: 0.42ms
// status: OK | payload_redacted: false
logger.LogInformation("Order {OrderId} processed successfully", result.OrderId);`,
        activeLines: [2, 3, 4, 5, 8, 9, 10],
      },
    ],
  },
  mapping: {
    id: "mapping",
    label: "Safe Projection",
    badge: "AstraFlow.Mapper",
    stages: [
      {
        tag: "01 / SOURCE",
        title: "Domain Model",
        sub: "Internal domain aggregate with rich encapsulation",
        csharpType: "public class OrderAggregate { public CustomerId Customer { get; } ... }",
        csharpSummary: "Domain invariants protected; mapping never forces public setters.",
        codeSnippet: `// Rich domain entity with private state and encapsulated invariants
public sealed class OrderAggregate
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Number { get; private set; } = string.Empty;
    public decimal Subtotal { get; private set; }
    public IReadOnlyList<OrderLine> Lines { get; } = [];
}`,
        activeLines: [2, 4, 5, 6, 7],
      },
      {
        tag: "02 / PLAN",
        title: "Projection Plan",
        sub: "Compile-time verified transformation rules",
        csharpType: "cfg.CreateMap<OrderAggregate, OrderDto>().ForMember(...)",
        csharpSummary: "Unmapped properties caught at startup, not in production runtime.",
        codeSnippet: `// Compile-time verified mapping profile
public sealed class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        CreateMap<OrderAggregate, OrderDto>()
            .Map(dest => dest.Total, src => src.Subtotal * 1.14m)
            .Map(dest => dest.ItemCount, src => src.Lines.Count);
    }
}`,
        activeLines: [6, 7, 8],
      },
      {
        tag: "03 / EMIT",
        title: "Expression Tree / IL",
        sub: "Compiled fast delegate matching hand-written C# performance",
        csharpType: "Func<OrderAggregate, OrderDto> compiledIL = plan.CompileFast();",
        csharpSummary: "Zero boxed allocations, zero runtime reflection on warm invocations.",
        codeSnippet: `// Generated fast IL delegate (equivalent hand-written code):
public static OrderDto MapFast(OrderAggregate src)
{
    return new OrderDto(
        Id: src.Id,
        Number: src.Number,
        Total: src.Subtotal * 1.14m,
        ItemCount: src.Lines.Count
    );
}`,
        activeLines: [4, 5, 6, 7, 8, 9],
      },
      {
        tag: "04 / DTO",
        title: "Verified Contract",
        sub: "Guaranteed complete DTO ready for serialization",
        csharpType: "public sealed record OrderDto(Guid Id, string Number, decimal Total, int ItemCount);",
        csharpSummary: "Safe for JSON serialization and public API boundary transport.",
        codeSnippet: `// Usage in ASP.NET Core Minimal API endpoint:
app.MapGet("/orders/{id:guid}", async (Guid id, IOrderRepo repo, IMapper mapper) =>
{
    var entity = await repo.GetByIdAsync(id);
    return entity is null 
        ? Results.NotFound() 
        : Results.Ok(mapper.Map<OrderDto>(entity));
});`,
        activeLines: [6, 7],
      },
    ],
  },
  diagnostics: {
    id: "diagnostics",
    label: "Observability Engine",
    badge: "AstraFlow.Diagnostics",
    stages: [
      {
        tag: "01 / INSTRUMENT",
        title: "ActivitySource Probe",
        sub: "OpenTelemetry ActivitySource started at entry boundary",
        csharpType: "using var activity = AstraFlowActivitySource.StartActivity(\"mediator.dispatch\");",
        csharpSummary: "W3C trace context propagated across async boundaries seamlessly.",
        codeSnippet: `// Native OpenTelemetry ActivitySource integration
public static class FlowTelemetry
{
    internal static readonly ActivitySource Source = new("AstraFlow.Mediator", "2.3.0");
    
    public static Activity? StartDispatch<TReq>(TReq req) where TReq : notnull =>
        Source.StartActivity("mediator.dispatch", ActivityKind.Internal)
              ?.SetTag("astraflow.request_type", typeof(TReq).Name);
}`,
        activeLines: [4, 6, 7, 8],
      },
      {
        tag: "02 / AUDIT",
        title: "Roslyn Analyzers",
        sub: "Build-time code validation preventing misconfigurations",
        csharpType: "AF0001: Missing handler registration | AF0002: Missing validator",
        csharpSummary: "Roslyn checks ensure every request has exactly one registered handler.",
        codeSnippet: `// Compile-time Roslyn diagnostic check in action:
// [AF0001] Error: 'SubmitFeedback' implements IRequest<bool> 
// but has no registered IRequestHandler<SubmitFeedback, bool> in solution.
public sealed record SubmitFeedback(string Comment) : IRequest<bool>;

// Fix applied: Register handler or mark internal
[AutoRegister]
public sealed class SubmitFeedbackHandler : IRequestHandler<SubmitFeedback, bool> { ... }`,
        activeLines: [2, 3, 4, 7, 8],
      },
      {
        tag: "03 / REDACT",
        title: "Sensitive-Data Mask",
        sub: "Zero sensitive information in telemetry traces",
        csharpType: "[SensitiveData] attribute masks tokens, card numbers, and PII",
        csharpSummary: "Automatic redaction guarantees compliance with GDPR & PCI standards.",
        codeSnippet: `// Automatic telemetry redaction engine
public sealed record PaymentDetails(
    [property: SensitiveData(RedactionMode.Mask)]
    string CardNumber,
    [property: SensitiveData(RedactionMode.Omit)]
    string Cvv,
    decimal Amount
);
// Telemetry Output: { CardNumber: "************4242", Amount: 185.50 }`,
        activeLines: [3, 4, 5, 6, 9],
      },
      {
        tag: "04 / COLLECT",
        title: "Execution Report",
        sub: "Granular breakdown of duration, allocations, and steps",
        csharpType: "AstraFlowInspectionReport { DurationMs = 0.38, PipelineSteps = 3 }",
        csharpSummary: "Inspect exact execution paths in tests and development diagnostics.",
        codeSnippet: `// In integration tests: inspect execution report directly
var report = await tester.RecordFlowAsync(async () => {
    return await sender.Send(new CreateOrder("ORD-1", 100m, cust));
});

Assert.True(report.Succeeded);
Assert.Equal(3, report.ExecutedBehaviors.Count);
Assert.True(report.ElapsedNanoseconds < 1_000_000); // Sub-millisecond`,
        activeLines: [2, 6, 7, 8],
      },
    ],
  },
};

interface FlowAxisState {
  scenario: FlowScenario;
  stage: FlowStageIndex;
}

type FlowAxisAction =
  | { type: "SET_SCENARIO"; scenario: FlowScenario }
  | { type: "SET_STAGE"; stage: FlowStageIndex };

function flowAxisReducer(state: FlowAxisState, action: FlowAxisAction): FlowAxisState {
  switch (action.type) {
    case "SET_SCENARIO":
      if (state.scenario === action.scenario) return state;
      return { scenario: action.scenario, stage: 0 };
    case "SET_STAGE":
      if (state.stage === action.stage) return state;
      return { ...state, stage: action.stage };
    default:
      return state;
  }
}

export function FlowObservatoryAxis() {
  const [state, dispatch] = useReducer(flowAxisReducer, {
    scenario: "dispatch",
    stage: 0,
  });

  const shouldReduceMotion = useReducedMotionContext();
  const componentId = useId();

  const currentScenario = SCENARIOS[state.scenario];
  const currentStage = currentScenario.stages[state.stage];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        dispatch({
          type: "SET_STAGE",
          stage: Math.min(3, state.stage + 1) as FlowStageIndex,
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        dispatch({
          type: "SET_STAGE",
          stage: Math.max(0, state.stage - 1) as FlowStageIndex,
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        dispatch({ type: "SET_STAGE", stage: 0 });
      } else if (e.key === "End") {
        e.preventDefault();
        dispatch({ type: "SET_STAGE", stage: 3 });
      }
    },
    [state.stage]
  );

  return (
    <div
      className="flow-observatory-axis w-full max-w-6xl mx-auto rounded-2xl bg-[#082c26] text-[#f7f3eb] p-6 md:p-10 border border-[#16443a] shadow-2xl relative overflow-hidden"
      role="region"
      aria-label="AstraFlow Flow Observatory: Calibrated Precision Track"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Precision Instrument Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-[#16443a]">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f25e3b] shadow-[0_0_8px_#f25e3b]" />
            <span className="font-mono text-xs tracking-widest text-[#92a69a] uppercase">
              EXPERIENCE A / ALTERNATIVE 1: PRECISION AXIS
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#16443a] text-[#f25e3b] font-semibold border border-[#23584c]">
              {currentScenario.badge}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif text-[#f7f3eb] mt-2">
            The Living Flow Observatory
          </h3>
          <p className="text-sm text-[#92a69a] mt-1 max-w-xl">
            An open precision track tracing typed declarations from dispatch to verifiable outcome.
            Use Arrow keys or click any node to align the optical code lens.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[#06211c] border border-[#16443a]"
          role="tablist"
          aria-label="Observatory Scenarios"
        >
          {(["dispatch", "mapping", "diagnostics"] as const).map((scKey) => {
            const sc = SCENARIOS[scKey];
            const isSelected = state.scenario === scKey;
            return (
              <button
                key={scKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => dispatch({ type: "SET_SCENARIO", scenario: scKey })}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors duration-150 ${
                  isSelected ? "text-[#f7f3eb] font-semibold" : "text-[#92a69a] hover:text-[#f7f3eb]"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isSelected && (
                  <motion.div
                    layoutId={`axis-scenario-pill-${componentId}`}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 30 }
                    }
                    className="absolute inset-0 rounded-lg bg-[#16443a] border border-[#2d6f60]"
                  />
                )}
                <span className="relative z-10">{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Calibrated Precision Axis (No enclosing 3-column box!) */}
      <div className="py-8 relative">
        {/* Calibrated Hairline Rail & Graticules */}
        <div className="relative w-full h-20 flex items-center">
          {/* Base graticule line */}
          <div className="absolute inset-x-0 h-[1.5px] bg-[#1a4a40]" />

          {/* Active progress beam */}
          <motion.div
            className="absolute left-0 h-[2px] bg-gradient-to-r from-[#2d6f60] via-[#f25e3b] to-[#ff8c69]"
            initial={false}
            animate={{ width: `${(state.stage / 3) * 100}%` }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
            }
          />

          {/* Precision Nodes across 4 stages */}
          <div className="relative w-full flex justify-between items-center z-10">
            {currentScenario.stages.map((stageItem, idx) => {
              const isSelected = state.stage === idx;
              const isPast = state.stage >= idx;
              return (
                <button
                  key={stageItem.tag}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_STAGE", stage: idx as FlowStageIndex })
                  }
                  aria-label={`Select ${stageItem.title}`}
                  className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f25e3b] rounded-xl p-2 transition-transform active:scale-[0.97]"
                >
                  {/* Outer ring & stage badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border font-mono text-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-[#f25e3b] text-[#ffffff] border-[#ff8c69] shadow-[0_0_20px_rgba(242,94,59,0.45)] scale-110"
                        : isPast
                        ? "bg-[#16443a] text-[#f7f3eb] border-[#2d6f60] group-hover:border-[#92a69a]"
                        : "bg-[#06211c] text-[#62766b] border-[#16443a] group-hover:border-[#2d6f60]"
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  {/* Stage Label */}
                  <span
                    className={`mt-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                      isSelected
                        ? "text-[#f25e3b] font-bold"
                        : isPast
                        ? "text-[#f7f3eb]"
                        : "text-[#62766b]"
                    }`}
                  >
                    {stageItem.tag.split("/")[1]?.trim() ?? stageItem.tag}
                  </span>

                  {/* Micro graticule tick mark */}
                  <div
                    className={`w-1 h-2 mt-1 rounded-full transition-colors ${
                      isSelected
                        ? "bg-[#f25e3b]"
                        : isPast
                        ? "bg-[#2d6f60]"
                        : "bg-[#16443a]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optical Code Lens & Stage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left: Stage Deep Dive (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#16443a] text-[#f25e3b] border border-[#2d6f60]">
                STAGE 0{state.stage + 1} OF 04
              </span>
              <span className="font-mono text-xs text-[#92a69a]">{currentStage.tag}</span>
            </div>

            <h4 className="text-xl md:text-2xl font-serif text-[#f7f3eb] mt-3">
              {currentStage.title}
            </h4>

            <p className="text-sm text-[#d6d3c8] mt-2 leading-relaxed">
              {currentStage.sub}
            </p>

            <div className="mt-4 p-3 rounded-lg bg-[#06211c] border border-[#16443a]">
              <div className="font-mono text-[11px] text-[#92a69a] uppercase">Architectural Invariant</div>
              <div className="font-mono text-xs text-[#ffb09c] mt-1 break-all">
                {currentStage.csharpType}
              </div>
            </div>

            <p className="text-xs text-[#92a69a] mt-3 leading-normal">
              {currentStage.csharpSummary}
            </p>
          </div>

          {/* Quick step navigation controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#16443a]">
            <button
              type="button"
              disabled={state.stage === 0}
              onClick={() =>
                dispatch({
                  type: "SET_STAGE",
                  stage: Math.max(0, state.stage - 1) as FlowStageIndex,
                })
              }
              className="px-3.5 py-1.5 rounded-lg border border-[#16443a] text-xs font-mono text-[#92a69a] hover:text-[#f7f3eb] hover:border-[#2d6f60] disabled:opacity-30 disabled:pointer-events-none active:scale-[0.97] transition-all"
            >
              ← Prev Stage
            </button>
            <span className="font-mono text-xs text-[#62766b]">
              Node 0{state.stage + 1} / 04
            </span>
            <button
              type="button"
              disabled={state.stage === 3}
              onClick={() =>
                dispatch({
                  type: "SET_STAGE",
                  stage: Math.min(3, state.stage + 1) as FlowStageIndex,
                })
              }
              className="px-3.5 py-1.5 rounded-lg border border-[#2d6f60] bg-[#16443a] text-xs font-mono text-[#f7f3eb] hover:bg-[#20574a] active:scale-[0.97] transition-all"
            >
              Next Stage →
            </button>
          </div>
        </div>

        {/* Right: Optical Code Lens (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#041714] border border-[#16443a] shadow-inner overflow-hidden flex flex-col">
          {/* Lens Terminal Chrome */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#03110e] border-b border-[#16443a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f25e3b]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f25e3b]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f25e3b]/20" />
              <span className="font-mono text-[11px] text-[#92a69a] ml-2">
                AstraFlow.Observatory.Lens :: {state.scenario}.cs
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#62766b] uppercase">C# 13 / .NET 9</span>
          </div>

          {/* Synchronized Code View */}
          <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${state.scenario}-${state.stage}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-0.5"
              >
                {currentStage.codeSnippet.split("\n").map((line, lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isHighlighted = currentStage.activeLines.includes(lineNum);
                  return (
                    <div
                      key={lineNum}
                      className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                        isHighlighted
                          ? "bg-[#16443a]/90 text-[#f7f3eb] font-semibold border-l-2 border-[#f25e3b]"
                          : "text-[#92a69a] hover:text-[#d6d3c8]"
                      }`}
                    >
                      <span className="w-7 select-none text-[10px] text-[#62766b] pr-2 text-right">
                        {lineNum}
                      </span>
                      <pre className="font-mono text-xs whitespace-pre overflow-x-visible">
                        <code>{line}</code>
                      </pre>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
