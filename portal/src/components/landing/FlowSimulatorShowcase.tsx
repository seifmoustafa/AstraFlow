"use client";

import React, { useState, useEffect } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Database,
  ArrowRight,
  Activity,
  Layers,
  Lock,
  Terminal,
  ShieldCheck,
  Cpu,
  Zap,
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  stages: {
    name: string;
    sublabel: string;
    description: string;
    badge: string;
    telemetry: Record<string, string | number | boolean>;
  }[];
}

const scenarios: Scenario[] = [
  {
    id: "place-order",
    name: "PlaceOrderCommand",
    badge: "Write Pipeline",
    description: "Write operation with input validation, transactional scope, and PII redaction",
    stages: [
      {
        name: "Validation Stage",
        sublabel: "AstraFlow.FluentValidation",
        description: "FluentValidation interceptor evaluates business invariants prior to dispatch",
        badge: "0.21 ms",
        telemetry: {
          "Pipeline.Phase": "Pre-Dispatch Validation",
          "Rules.Evaluated": 4,
          "Validation.Status": "Passed",
          "Payload.Sanitized": true,
        },
      },
      {
        name: "Security Redaction",
        sublabel: "AstraFlow.Security",
        description: "Defense-in-depth masking redacts credentials & payment tokens from span tags",
        badge: "Masked",
        telemetry: {
          "CardNumber": "•••• •••• •••• 4242",
          "CVV": "[REDACTED_BY_POLICY]",
          "CustomerEmail": "j***@domain.com",
          "Policy": "StrictPiiRedactionPolicy",
        },
      },
      {
        name: "Telemetry Span",
        sublabel: "AstraFlow.OpenTelemetry",
        description: "ActivitySource records W3C TraceContext spans with zero unnecessary allocations",
        badge: "Span Recorded",
        telemetry: {
          "Activity.Name": "Mediator.Dispatch.PlaceOrderCommand",
          "SpanId": "e84f29a0b12c84",
          "TraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
          "Diagnostics.Tags": "Redacted (4 tags)",
        },
      },
      {
        name: "Handler Execution",
        sublabel: "AstraFlow.Mediator",
        description: "Domain command handler processes business logic and commits to outbox",
        badge: "Committed",
        telemetry: {
          "Handler": "PlaceOrderCommandHandler",
          "DbContext.State": "Committed",
          "Outbox.Events": 1,
          "ExecutionDuration": "1.42 ms",
        },
      },
    ],
  },
  {
    id: "project-invoice",
    name: "ProjectInvoiceQuery",
    badge: "Read Projection",
    description: "Read query projecting SQL database entity directly to DTO via EF Core",
    stages: [
      {
        name: "Query Gate",
        sublabel: "AstraFlow.Mediator",
        description: "Mediator resolves handler and passes cancellation token without runtime reflection",
        badge: "0.08 ms",
        telemetry: {
          "Query.Type": "IRequest<InvoiceDto>",
          "CacheLookup": "Bypassed (Direct)",
          "CancellationToken.IsActive": true,
        },
      },
      {
        name: "EF Expression Tree",
        sublabel: "AstraFlow.Mapper.EntityFrameworkCore",
        description: "ProjectTo compiles entity expression tree into selective SQL SELECT columns",
        badge: "Compiled",
        telemetry: {
          "Projection.Provider": "AstraFlowProjectionProvider",
          "Expression.Tree": "x => new InvoiceDto { Id = x.Id, Total = x.Total }",
          "Query.SQL.Columns": "Selective (id, total, status)",
        },
      },
      {
        name: "Database Stream",
        sublabel: "AppDbContext (Npgsql)",
        description: "Direct SQL execution via compiled EF Core expression delegate",
        badge: "1 Row",
        telemetry: {
          "SQL.RowsRead": 1,
          "EFCore.Tracking": "NoTracking",
          "Allocations": "32 B",
        },
      },
      {
        name: "DTO Assembly",
        sublabel: "AstraFlow.Mapper",
        description: "Type-safe DTO returned with zero intermediary memory allocations",
        badge: "200 OK",
        telemetry: {
          "Return.Type": "InvoiceSummaryDto",
          "Status": "200 OK",
          "ExecutionDuration": "0.85 ms",
        },
      },
    ],
  },
  {
    id: "order-created-event",
    name: "OrderCreatedEvent",
    badge: "Notification Fan-Out",
    description: "Multi-subscriber async notification fan-out with isolated exception barriers",
    stages: [
      {
        name: "Publish Request",
        sublabel: "AstraFlow.Mediator",
        description: "Mediator publishes INotification to 3 subscribed notification handlers",
        badge: "3 Handlers",
        telemetry: {
          "Notification.Type": "OrderCreatedEvent",
          "PublishStrategy": "ParallelWhenAll",
          "RegisteredSubscribers": 3,
        },
      },
      {
        name: "Email Dispatcher",
        sublabel: "SendOrderConfirmationEmailHandler",
        description: "Subscriber sends customer order confirmation email asynchronously",
        badge: "Dispatched",
        telemetry: {
          "Handler": "SendOrderConfirmationEmailHandler",
          "Delivery": "SMTP Outbox",
          "Status": "Success",
        },
      },
      {
        name: "Inventory Reserve",
        sublabel: "ReserveWarehouseStockHandler",
        description: "Subscriber claims inventory quantity in local cache table",
        badge: "Stock Held",
        telemetry: {
          "Handler": "ReserveWarehouseStockHandler",
          "ItemsReserved": 2,
          "Status": "Success",
        },
      },
      {
        name: "Analytics Ingest",
        sublabel: "TrackOrderMetricsHandler",
        description: "Subscriber records high-volume metrics via System.Diagnostics.Metrics",
        badge: "Emitted",
        telemetry: {
          "Handler": "TrackOrderMetricsHandler",
          "Metric": "orders.volume.counter",
          "Tags": "region=eu-west-1",
        },
      },
    ],
  },
];

export const FlowSimulatorShowcase: React.FC = () => {
  const { locale } = usePortal();
  const [activeScenarioId, setActiveScenarioId] = useState<string>("place-order");
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const currentStage = scenario.stages[activeStageIndex];

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStageIndex((prev) => {
          if (prev >= scenario.stages.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, scenario.stages.length]);

  const handleScenarioChange = (id: string) => {
    setActiveScenarioId(id);
    setActiveStageIndex(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setActiveStageIndex(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (activeStageIndex < scenario.stages.length - 1) {
      setActiveStageIndex(prev => prev + 1);
    } else {
      setActiveStageIndex(0);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl transition-all duration-300">
      {/* Top Header Dock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--af-border)] px-6 py-4 bg-[var(--af-bg-canvas)]/80 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--af-accent)]/15 border border-[var(--af-accent)]/30 text-[var(--af-accent)]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--af-text-primary)]">
                Interactive Flow Trace Simulator
              </h3>
              <span className="rounded-full bg-[var(--af-accent)]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--af-accent)] border border-[var(--af-accent)]/20">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)]">
              Step through real AstraFlow pipeline executions, boundary gates, and redacted telemetry.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isPlaying
                ? "bg-[var(--af-copper)] text-white shadow-sm"
                : "bg-[var(--af-accent)] text-[var(--af-accent-on)] hover:brightness-110 shadow-sm"
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isPlaying ? "fill-current" : ""}`} />
            <span>{isPlaying ? "Pause Trace" : "Run Trace"}</span>
          </button>

          <button
            onClick={handleStepForward}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--af-border)] px-3 py-1.5 text-xs font-medium text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] transition-colors"
          >
            <span>Next Stage</span>
            <ArrowRight className="h-3 w-3" />
          </button>

          <button
            onClick={handleReset}
            title="Reset trace to stage 1"
            className="flex items-center justify-center rounded-lg border border-[var(--af-border)] p-1.5 text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="flex border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] px-6 py-2.5 gap-2 overflow-x-auto scrollbar-none">
        {scenarios.map((s) => {
          const isSelected = s.id === activeScenarioId;
          return (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(s.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? "bg-[var(--af-accent)]/10 text-[var(--af-accent)] border border-[var(--af-accent)]/30 font-semibold shadow-xs"
                  : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] border border-transparent"
              }`}
            >
              <span>{s.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isSelected ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold" : "bg-[var(--af-surface-3)] text-[var(--af-text-subtle)]"
              }`}>
                {s.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Canvas */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Pipeline Stage Breadcrumb Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenario.stages.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveStageIndex(idx);
                  setIsPlaying(false);
                }}
                className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? "border-[var(--af-accent)] bg-[var(--af-accent)]/10 shadow-md ring-1 ring-[var(--af-accent)]/30"
                    : isCompleted
                    ? "border-[var(--af-success)]/40 bg-[var(--af-success)]/5 hover:bg-[var(--af-surface-2)]"
                    : "border-[var(--af-border)]/60 bg-[var(--af-bg-canvas)]/40 hover:bg-[var(--af-surface-2)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold ${
                      isActive ? "text-[var(--af-accent)]" : isCompleted ? "text-[var(--af-success)]" : "text-[var(--af-text-subtle)]"
                    }`}>
                      0{idx + 1} // STAGE
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      isActive
                        ? "bg-[var(--af-accent)] text-[var(--af-accent-on)]"
                        : isCompleted
                        ? "bg-[var(--af-success)]/20 text-[var(--af-success)]"
                        : "bg-[var(--af-surface-2)] text-[var(--af-text-subtle)]"
                    }`}>
                      {stage.badge}
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold leading-tight ${
                    isActive ? "text-[var(--af-text-primary)]" : "text-[var(--af-text-secondary)]"
                  }`}>
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-[var(--af-text-subtle)] mt-1 truncate">
                    {stage.sublabel}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--af-border)]/50 flex items-center justify-between text-[10px]">
                  <span className="text-[var(--af-text-subtle)]">State</span>
                  <span className={`font-mono font-semibold ${
                    isActive ? "text-[var(--af-accent)]" : isCompleted ? "text-[var(--af-success)]" : "text-[var(--af-text-subtle)]"
                  }`}>
                    {isActive ? "ACTIVE EXECUTING" : isCompleted ? "VERIFIED PASSED" : "PENDING"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Stage Inspector & Telemetry Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] overflow-hidden">
          {/* Left Column: Architectural Intent */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--af-border)]">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--af-accent)] font-semibold">
                  Executing Pipeline Subsystem
                </span>
                <h4 className="text-lg font-bold text-[var(--af-text-primary)] mt-1">
                  {currentStage.name}
                </h4>
                <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded bg-[var(--af-surface-2)] text-xs font-mono text-[var(--af-accent)] border border-[var(--af-border)]">
                  {currentStage.sublabel}
                </div>
              </div>

              <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                {currentStage.description}
              </p>

              <div className="rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-surface)] p-3 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block">
                  Subsystem Guarantees
                </span>
                <div className="space-y-1.5 text-xs text-[var(--af-text-secondary)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)] shrink-0" />
                    <span>Strict cancellation token propagation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)] shrink-0" />
                    <span>Zero unconstrained dynamic string reflection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)] shrink-0" />
                    <span>Automated PII & credential redaction in telemetry</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--af-border)] flex items-center justify-between text-xs text-[var(--af-text-subtle)]">
              <span>Active Scenario: {scenario.name}</span>
              <span className="font-mono text-[var(--af-accent)]">Stage {activeStageIndex + 1} of 4</span>
            </div>
          </div>

          {/* Right Column: Live Telemetry & Tags Console */}
          <div className="lg:col-span-7 p-6 bg-neutral-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[var(--af-accent)]" />
                  <span className="text-xs font-mono font-medium text-neutral-300">
                    Diagnostics & Activity Tags (OpenTelemetry Safe)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--af-success)] bg-[var(--af-success)]/10 px-2 py-0.5 rounded border border-[var(--af-success)]/30">
                  SANITIZED
                </span>
              </div>

              {/* Key-Value Tag List */}
              <div className="space-y-2 font-mono text-xs">
                {Object.entries(currentStage.telemetry).map(([key, value], idx) => {
                  const isRedacted = String(value).includes("REDACTED") || String(value).includes("••••");

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 px-3 rounded bg-neutral-900/80 border border-neutral-800/80 gap-1"
                    >
                      <span className="text-neutral-400 select-all">{key}</span>
                      <span className={`select-all font-semibold break-all ${
                        isRedacted
                          ? "text-[var(--af-copper)] bg-[var(--af-copper)]/10 px-1.5 py-0.2 rounded"
                          : typeof value === "boolean"
                          ? "text-[var(--af-success)]"
                          : "text-[var(--af-accent)]"
                      }`}>
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>W3C TraceContext: Active</span>
              <span className="text-neutral-400">Zero Leakage Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
