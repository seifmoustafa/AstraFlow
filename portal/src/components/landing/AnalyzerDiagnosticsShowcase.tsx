"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  AlertTriangle,
  Cpu,
  CheckCircle2,
  FileCode,
  Wrench,
  Search,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface DiagnosticRule {
  id: string;
  category: "Mediator" | "Mapper" | "Projections" | "Security";
  severity: "Error" | "Warning" | "Info";
  title: string;
  description: string;
  squiggledCode: string;
  errorLine: number;
  generatorOutput: string;
  codeFixPreview: string;
}

const diagnosticRules: DiagnosticRule[] = [
  {
    id: "AFAN0101",
    category: "Mediator",
    severity: "Error",
    title: "Missing Request Handler",
    description:
      "A request contract was declared and dispatched via IMediator, but no matching IRequestHandler<TRequest, TResponse> implementation exists in the current compilation.",
    errorLine: 4,
    squiggledCode: `public class CheckoutService
{
    public async Task Process(IMediator mediator)
    {
        // AFAN0101: No handler found for 'SubmitPaymentCommand'
        await mediator.SendAsync(new SubmitPaymentCommand());
    }
}`,
    generatorOutput: `// AstraFlow.Generators (Mediator Registration Discovery)
// Discovered handlers: 0 for SubmitPaymentCommand
// Compiler Diagnostic Emitted: AFAN0101`,
    codeFixPreview: `// Auto-generated Code Fix: Scaffold missing handler
public sealed class SubmitPaymentCommandHandler 
    : IRequestHandler<SubmitPaymentCommand, PaymentResult>
{
    public Task<PaymentResult> HandleAsync(
        SubmitPaymentCommand request, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}`,
  },
  {
    id: "AFAN0202",
    category: "Security",
    severity: "Warning",
    title: "Reverse Map Sensitive Write",
    description:
      "Reverse convention mapping configuration attempts to write untrusted input into sensitive or read-only destination members (e.g. IsAdmin, SecurityStamp).",
    errorLine: 5,
    squiggledCode: `public partial class UserProfileMapper
{
    // AFAN0202: Inbound reverse mapping may overwrite 'IsAdmin'
    [AstraGenerateMapping]
    public partial void ApplyUpdate(UpdateUserDto dto, UserEntity entity);
}`,
    generatorOutput: `// AstraFlow.Generators (Safe Mapping Validator)
// Property 'IsAdmin' on destination 'UserEntity' is flagged as SecuritySensitive.
// Direct convention assignment blocked.`,
    codeFixPreview: `// Code Fix: Add explicit ignore or custom projection rule
public partial class UserProfileMapper
{
    [AstraGenerateMapping(Ignore = new[] { nameof(UserEntity.IsAdmin) })]
    public partial void ApplyUpdate(UpdateUserDto dto, UserEntity entity);
}`,
  },
  {
    id: "AFAN0302",
    category: "Projections",
    severity: "Error",
    title: "Mapper Call Inside Query Expression",
    description:
      "A custom in-memory mapper method was invoked inside an Entity Framework query expression tree, which EF Core cannot translate to SQL at runtime.",
    errorLine: 4,
    squiggledCode: `public IQueryable<UserDto> GetUsers(AppDbContext db)
{
    return db.Users.Select(u => 
        // AFAN0302: Mapper call cannot be translated to SQL
        UserMapper.ToDto(u)
    );
}`,
    generatorOutput: `// AstraFlow.Generators (EF Projection Analyzer)
// Detected non-translatable delegate call 'UserMapper.ToDto' inside IQueryable.Select()
// Recommend: Use AstraFlow .ProjectTo<User, UserDto>()`,
    codeFixPreview: `// Code Fix: Replace with verified compile-time ProjectTo expression
public IQueryable<UserDto> GetUsers(AppDbContext db)
{
    return db.Users
        .AsNoTracking()
        .ProjectTo<User, UserDto>(); // Generates exact SQL projection
}`,
  },
  {
    id: "AFAN0102",
    category: "Mediator",
    severity: "Error",
    title: "Duplicate Request Handler",
    description:
      "More than one handler was registered for the same command contract. AstraFlow enforces unambiguous single-handler semantics for commands.",
    errorLine: 2,
    squiggledCode: `// AFAN0102: Duplicate handler for CreateOrderCommand
public class PrimaryOrderHandler : IRequestHandler<CreateOrderCommand, OrderResult> { ... }
public class SecondaryOrderHandler : IRequestHandler<CreateOrderCommand, OrderResult> { ... }`,
    generatorOutput: `// AstraFlow.Generators (Registration Collision Check)
// Found 2 conflicting handler types for CreateOrderCommand.
// Command dispatch requires strict single ownership.`,
    codeFixPreview: `// Code Fix: Merge handlers or convert to INotification for fan-out
public class OrderNotificationHandler : INotificationHandler<OrderCreatedNotification> { ... }`,
  },
];

export function AnalyzerDiagnosticsShowcase() {
  const { locale } = usePortal();
  const [selectedRule, setSelectedRule] = useState<DiagnosticRule>(diagnosticRules[0]);
  const [viewMode, setViewMode] = useState<"compiler" | "generator" | "fix">("compiler");

  return (
    <section className="py-20 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>SHOWCASE 04 · ROSLYN ANALYZERS & SOURCE GENERATORS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mb-3">
              {locale === "ar"
                ? "مفتش محلل Roslyn ومولدات الكود البرمجي"
                : "Roslyn Analyzer Squiggles & Source Generator Output"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--af-text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "تكتشف حزم AstraFlow.Analyzers أخطاء التصميم المعماري وثغرات حجب البيانات في محرر الأكواد قبل تشغيل البرنامج، مع إصلاحات سريعة بنقرة واحدة."
                : "Catch architectural drift, missing handlers, and unmapped fields directly in Visual Studio, Rider, or VS Code before runtime."}
            </p>
          </div>
        </div>

        {/* 2-Column Inspector Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Rule Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--af-text-subtle)] mb-2 px-1">
              Select Roslyn Rule ({diagnosticRules.length} Active Rules)
            </div>

            {diagnosticRules.map((rule) => {
              const active = rule.id === selectedRule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 rounded-lg border transition-af cursor-pointer text-left ${
                    active
                      ? "bg-[var(--af-bg-surface)] border-[var(--af-accent)] ring-1 ring-[var(--af-accent)] shadow-sm"
                      : "bg-[var(--af-bg-surface)]/50 border-[var(--af-border)] hover:border-[var(--af-text-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[var(--af-accent)]">
                      {rule.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        rule.severity === "Error"
                          ? "bg-[var(--af-danger)]/15 text-[var(--af-danger)] border border-[var(--af-danger)]/30"
                          : "bg-[var(--af-warning)]/15 text-[var(--af-warning)] border border-[var(--af-warning)]/30"
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--af-text-primary)] mb-1">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-[var(--af-text-secondary)] line-clamp-2 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Code Editor & Generator Output */}
          <div className="lg:col-span-8 rounded-[var(--af-radius-card)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] overflow-hidden shadow-sm">
            {/* View Mode Toggle Bar */}
            <div className="px-5 py-3 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--af-text-primary)]">
                  Diagnostic: {selectedRule.id} · {selectedRule.title}
                </span>
              </div>

              {/* View Switches */}
              <div className="flex items-center gap-1.5 bg-[var(--af-bg-surface)] p-1 rounded-md border border-[var(--af-border)] text-xs font-mono">
                <button
                  onClick={() => setViewMode("compiler")}
                  className={`px-2.5 py-1 rounded transition-af cursor-pointer ${
                    viewMode === "compiler"
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                      : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                  }`}
                >
                  Compiler Squiggle
                </button>
                <button
                  onClick={() => setViewMode("generator")}
                  className={`px-2.5 py-1 rounded transition-af cursor-pointer ${
                    viewMode === "generator"
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                      : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                  }`}
                >
                  Source Generator Log
                </button>
                <button
                  onClick={() => setViewMode("fix")}
                  className={`px-2.5 py-1 rounded transition-af cursor-pointer ${
                    viewMode === "fix"
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                      : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                  }`}
                >
                  1-Click Code Fix
                </button>
              </div>
            </div>

            {/* Display Body */}
            <div className="p-6 font-mono text-xs overflow-x-auto bg-[var(--af-bg-canvas)]">
              {viewMode === "compiler" && (
                <div>
                  <div className="mb-3 text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                    <span>// IDE C# Compilation Buffer</span>
                    <span className="text-[var(--af-danger)] font-bold">1 Warning / Error Highlighted</span>
                  </div>
                  <pre className="text-[var(--af-text-primary)] leading-relaxed select-all">
                    <code>{selectedRule.squiggledCode}</code>
                  </pre>
                  <div className="mt-4 p-3 rounded bg-[var(--af-danger)]/10 border border-[var(--af-danger)]/30 text-[var(--af-danger)] text-xs">
                    <span className="font-bold">[{selectedRule.id}]: </span>
                    {selectedRule.description}
                  </div>
                </div>
              )}

              {viewMode === "generator" && (
                <div>
                  <div className="mb-3 text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                    <span>// Roslyn IIncrementalGenerator Telemetry</span>
                    <span className="text-[var(--af-accent)]">AstraFlow.Generators</span>
                  </div>
                  <pre className="text-[var(--af-text-secondary)] leading-relaxed select-all">
                    <code>{selectedRule.generatorOutput}</code>
                  </pre>
                </div>
              )}

              {viewMode === "fix" && (
                <div>
                  <div className="mb-3 text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                    <span>// Roslyn CodeAction: Apply 1-Click Code Fix</span>
                    <span className="text-[var(--af-success)] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Clean Build Expected
                    </span>
                  </div>
                  <pre className="text-[var(--af-text-primary)] leading-relaxed select-all">
                    <code>{selectedRule.codeFixPreview}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="px-5 py-3 bg-[var(--af-bg-surface)] border-t border-[var(--af-border)] flex items-center justify-between text-xs font-mono text-[var(--af-text-subtle)]">
              <span>Category: {selectedRule.category}</span>
              <span>Available in: AstraFlow.Analyzers v2.3.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
