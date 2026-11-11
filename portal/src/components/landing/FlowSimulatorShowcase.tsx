"use client";

import React, { useState, useEffect } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  Play,
  RotateCcw,
  Shield,
  Eye,
  CheckCircle2,
  Database,
  ArrowRight,
  Activity,
  Layers,
  Lock,
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  description: string;
  stages: {
    name: string;
    description: string;
    telemetry: Record<string, string | number | boolean>;
  }[];
}

const scenarios: Scenario[] = [
  {
    id: "place-order",
    name: "PlaceOrderCommand",
    description: "Write operation with input validation, transactional scope, and redaction",
    stages: [
      {
        name: "Validation Stage",
        description: "AstraFlow.FluentValidation intercepts incoming command",
        telemetry: {
          "Pipeline.Phase": "Pre-Dispatch Validation",
          "Rules.Evaluated": 4,
          "Validation.Status": "Passed",
          "Payload.Sanitized": true,
        },
      },
      {
        name: "Security Redaction",
        description: "AstraFlow.Security masks payment details & customer credentials",
        telemetry: {
          "CardNumber": "•••• •••• •••• 4242",
          "CVV": "[REDACTED_BY_POLICY]",
          "CustomerEmail": "j***@domain.com",
          "Policy": "StrictPiiRedactionPolicy",
        },
      },
      {
        name: "Telemetry Span",
        description: "AstraFlow.OpenTelemetry records ActivitySource activity & tags",
        telemetry: {
          "Activity.Name": "Mediator.Dispatch.PlaceOrderCommand",
          "SpanId": "e84f29a0b12c84",
          "TraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
          "Allocations": "0 B",
        },
      },
      {
        name: "Handler Execution",
        description: "PlaceOrderCommandHandler handles business logic and DB write",
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
    description: "Zero-overhead read query projecting SQL database entity directly to DTO",
    stages: [
      {
        name: "Cache & Query Gate",
        description: "AstraFlow.Mediator evaluates pipeline caching & cancellation token",
        telemetry: {
          "Query.Type": "IRequest<InvoiceDto>",
          "CacheLookup": "Bypassed (Direct)",
          "CancellationToken.IsActive": true,
        },
      },
      {
        name: "EF Expression Tree",
        description: "AstraFlow.Mapper.EntityFrameworkCore creates ProjectTo expression",
        telemetry: {
          "Projection.Provider": "AstraFlowProjectionProvider",
          "Expression.Tree": "x => new InvoiceDto { Id = x.Id, Total = x.Total }",
          "Query.SQL.Columns": "Selective (id, total, status)",
        },
      },
      {
        name: "Database Stream",
        description: "Direct SQL execution via compiled EF Core expression delegate",
        telemetry: {
          "SQL.RowsRead": 1,
          "EFCore.Tracking": "NoTracking",
          "MemoryAllocated": "32 B",
        },
      },
      {
        name: "DTO Assembly",
        description: "Returned type-safe DTO with zero intermediary object allocations",
        telemetry: {
          "Return.Type": "InvoiceSummaryDto",
          "Status": "200 OK",
          "ExecutionDuration": "0.85 ms",
        },
      },
    ],
  },
  {
    id: "publish-payment",
    name: "PublishPaymentNotification",
    description: "Multi-subscriber asynchronous notification fan-out with exception isolation",
    stages: [
      {
        name: "Notification Ingestion",
        description: "IMediator.PublishAsync broadcasts payment confirmation",
        telemetry: {
          "Notification": "PaymentConfirmedNotification",
          "Subscribers.Discovered": 3,
          "Strategy": "Task.WhenAll (Isolated)",
        },
      },
      {
        name: "Diagnostics Trace",
        description: "ActivitySource spans attached for all subscriber branches",
        telemetry: {
          "Parent.SpanId": "09c2a8f3b41e",
          "ActiveListeners": 3,
          "DiagnosticName": "AstraFlow.Mediator.Notification",
        },
      },
      {
        name: "Concurrent Handlers",
        description: "ReceiptEmailHandler, LedgerSyncHandler, AnalyticsHandler executed",
        telemetry: {
          "EmailHandler": "Succeeded (0.4ms)",
          "LedgerHandler": "Succeeded (0.6ms)",
          "AnalyticsHandler": "Succeeded (0.2ms)",
        },
      },
      {
        name: "Trace Completion",
        description: "Consolidated telemetry published with zero error count",
        telemetry: {
          "AllSubscribersCompleted": true,
          "FaultedCount": 0,
          "TotalExecutionTime": "0.68 ms",
        },
      },
    ],
  },
  {
    id: "validate-input",
    name: "ValidateCustomerInput",
    description: "Compiler-safe schema verification preventing invalid pipeline dispatch",
    stages: [
      {
        name: "Request Schema Check",
        description: "AstraFlow.Analyzers statically verified contract compatibility",
        telemetry: {
          "Roslyn.Verified": true,
          "Contract": "IRequest<ValidationResult>",
          "HandlerMismatch": "None",
        },
      },
      {
        name: "Rule Engine Evaluation",
        description: "Synchronous FluentValidation execution with early short-circuit",
        telemetry: {
          "Rule.ZipCodeFormat": "Passed",
          "Rule.VatIdentifier": "Passed",
          "ShortCircuitTriggered": false,
        },
      },
      {
        name: "Redaction Verification",
        description: "Sensitive tax identifiers masked before telemetry dispatch",
        telemetry: {
          "TaxId": "US-XX-XXX-9182",
          "Audit.Logged": true,
          "SecurityScan": "Clean",
        },
      },
      {
        name: "Result Synthesis",
        description: "Clean validation envelope ready for downstream processing",
        telemetry: {
          "Validation.IsValid": true,
          "Errors": 0,
          "Elapsed": "0.32 ms",
        },
      },
    ],
  },
];

export function FlowSimulatorShowcase() {
  const { locale } = usePortal();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStage((prev) => {
          if (prev >= selectedScenario.stages.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedScenario]);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setActiveStage(0);
    setIsPlaying(false);
  };

  const handleStep = () => {
    if (activeStage < selectedScenario.stages.length - 1) {
      setActiveStage(activeStage + 1);
    } else {
      setActiveStage(0);
    }
  };

  const handleReset = () => {
    setActiveStage(0);
    setIsPlaying(false);
  };

  const currentStageData = selectedScenario.stages[activeStage];

  return (
    <section className="py-20 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>SHOWCASE 01 · INTERACTIVE FLOW TRACE SIMULATOR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mb-3">
              {locale === "ar"
                ? "محاكي تدفق المسار: [طلب] ← [تحويل] ← [إرسال] ← [فحص]"
                : "The Flow Trace: [ Request ] → [ Transform ] → [ Dispatch ] → [ Inspect ]"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--af-text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "تتبع كيفية تنقل العمليات عبر مراحل الأنابيب المعيارية، مع فحص المقاييس الحية وضمانات حجب البيانات الحساسة."
                : "Step through explicit pipeline stages in real-time. Witness zero-overhead dispatch, security redaction boundaries, and structured OpenTelemetry traces."}
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {scenarios.map((sc) => {
              const active = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleScenarioChange(sc)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-af cursor-pointer border ${
                    active
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold border-[var(--af-accent)]"
                      : "bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] border-[var(--af-border)] hover:text-[var(--af-text-primary)] hover:border-[var(--af-text-secondary)]"
                  }`}
                >
                  {sc.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Simulator Shell */}
        <div className="rounded-[var(--af-radius-card)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] overflow-hidden shadow-sm">
          {/* Top Control Bar */}
          <div className="px-5 py-3.5 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--af-text-secondary)]">
                Active Scenario:
              </span>
              <span className="text-xs font-mono font-bold text-[var(--af-accent)]">
                {selectedScenario.name}
              </span>
              <span className="text-xs text-[var(--af-text-subtle)] hidden sm:inline">
                · {selectedScenario.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-af cursor-pointer ${
                  isPlaying
                    ? "bg-[var(--af-copper)] text-white"
                    : "bg-[var(--af-accent)] text-[var(--af-accent-on)] hover:opacity-90"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlaying ? (locale === "ar" ? "إيقاف مؤقت" : "Pause") : (locale === "ar" ? "تشغيل التدفق" : "Run Trace")}</span>
              </button>

              <button
                onClick={handleStep}
                disabled={isPlaying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium border border-[var(--af-border)] bg-[var(--af-bg-canvas)] text-[var(--af-text-primary)] hover:border-[var(--af-accent)] disabled:opacity-50 transition-af cursor-pointer"
              >
                <span>{locale === "ar" ? "الخطوة التالية" : "Step"}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </button>

              <button
                onClick={handleReset}
                title="Reset simulation"
                className="p-1.5 rounded text-xs border border-[var(--af-border)] bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] transition-af cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pipeline Stage Visualizer */}
          <div className="p-6 md:p-8 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {selectedScenario.stages.map((stage, idx) => {
                const isCurrent = idx === activeStage;
                const isPassed = idx < activeStage;
                return (
                  <div
                    key={stage.name}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStage(idx);
                    }}
                    className={`p-4 rounded-lg border transition-af cursor-pointer text-left relative ${
                      isCurrent
                        ? "bg-[var(--af-bg-surface)] border-[var(--af-accent)] ring-1 ring-[var(--af-accent)] shadow-sm"
                        : isPassed
                        ? "bg-[var(--af-bg-surface)]/60 border-[var(--af-success)]/40 text-[var(--af-text-secondary)]"
                        : "bg-[var(--af-bg-surface)]/30 border-[var(--af-border)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* Stage Number & Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-[var(--af-text-subtle)]">
                        STAGE 0{idx + 1}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--af-success)]" />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-accent)]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--af-border)]" />
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-[var(--af-text-primary)] mb-1">
                      {stage.name}
                    </h4>
                    <p className="text-xs text-[var(--af-text-secondary)] line-clamp-2 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Flow arrow on desktop */}
                    {idx < selectedScenario.stages.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-[var(--af-border)]">
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Diagnostics & Telemetry Terminal View */}
          <div className="p-6 md:p-8 bg-[var(--af-bg-surface)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--af-accent)]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--af-text-primary)]">
                  Live Stage Telemetry & Structured Diagnostics
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--af-text-subtle)]">
                Status: Stage {activeStage + 1} of {selectedScenario.stages.length}
              </span>
            </div>

            <div className="rounded-md border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="text-[var(--af-text-subtle)] mb-2 pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                <span>// Event: {currentStageData.name}</span>
                <span className="text-[var(--af-accent)] font-semibold">ActivitySource: AstraFlow.Telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-[var(--af-text-secondary)]">
                {Object.entries(currentStageData.telemetry).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-[var(--af-border)]/40">
                    <span className="text-[var(--af-text-subtle)]">{key}:</span>
                    <span
                      className={`font-semibold ${
                        String(val).includes("REDACTED") || String(val).includes("••••")
                          ? "text-[var(--af-copper)]"
                          : String(val) === "true" || String(val) === "Passed" || String(val) === "Clean"
                          ? "text-[var(--af-success)]"
                          : "text-[var(--af-text-primary)]"
                      }`}
                    >
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--af-text-subtle)] font-mono">
              <Lock className="w-3.5 h-3.5 text-[var(--af-copper)]" />
              <span>
                Safety Guarantee: Telemetry output preserves redaction boundaries; PII and sensitive payment keys are masked prior to tracing.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
