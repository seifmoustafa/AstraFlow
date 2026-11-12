"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePortal } from "@/context/PortalContext";
import { AstraFlowLogoMark } from "@/components/brand/AstraFlowLogo";
import {
  Terminal,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Play,
  Cpu,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function HeroSection() {
  const { t, locale } = usePortal();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"dispatch" | "mapping" | "inspect">("dispatch");

  const installCmd = "dotnet add package AstraFlow --version 2.3.0";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
      {/* Dynamic Background Atmosphere & Precision Grids */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, var(--af-accent) 0%, transparent 70%)",
          }}
        />

        {/* Engineering Coordinate Grid with radial fade */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-30"
          style={{
            backgroundImage: `radial-gradient(var(--af-border) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 40%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 40%, transparent 85%)",
          }}
        />

        {/* Dual Thin Flow Trace SVG Path with Animated Micro-Nodes */}
        <svg
          className="absolute w-full h-full left-0 top-0 opacity-60 dark:opacity-40"
          viewBox="0 0 1440 700"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Ion Cyan Trace Path */}
          <path
            d="M -100 240 C 250 180, 520 410, 820 280 C 1080 170, 1260 340, 1550 260"
            stroke="var(--af-accent)"
            strokeWidth="1.25"
            strokeDasharray="6 6"
          />
          {/* Secondary Structural Flow Line */}
          <path
            d="M -50 310 C 320 380, 680 160, 960 220 C 1200 270, 1340 180, 1520 220"
            stroke="var(--af-accent)"
            strokeWidth="0.75"
            className="opacity-40"
          />

          {/* Micro-nodes: strictly < 5% area */}
          <circle cx="820" cy="280" r="4" fill="var(--af-accent)" />
          <circle cx="960" cy="220" r="3" fill="var(--af-copper)" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Status & Architectural Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {/* Stable Version Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--af-border)] bg-[var(--af-bg-surface)] text-xs font-mono text-[var(--af-text-primary)] shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--af-success)] shadow-[0_0_8px_var(--af-success)]" />
            <span className="font-semibold text-[var(--af-accent)]">v2.3.0</span>
            <span className="text-[var(--af-text-secondary)]">
              {locale === "ar" ? "مستقر ومنشور" : "Stable Published"}
            </span>
          </div>

          {/* In-Development Preview Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--af-copper)]/40 bg-[var(--af-copper)]/10 text-xs font-mono text-[var(--af-copper)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">v2.4.0 Preview</span>
            <span className="text-[11px] opacity-85 hidden sm:inline">
              ({locale === "ar" ? "تأكيدات حيادية + مطابقة مولّدة" : "Runner-Neutral Assertions & Executable Mapping"})
            </span>
          </div>

          {/* Target Framework Support Tag */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono text-[var(--af-text-secondary)] border border-[var(--af-border)] bg-[var(--af-bg-surface)]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--af-accent)]" />
            <span>netstandard2.0 · .NET 8, 9 &amp; 10</span>
          </div>
        </div>

        {/* Master Asymmetric Layout: Left Editorial + Right Live Interactive Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center mb-16">
          {/* Left Column: Brand Lockup, Typography & Clear Thesis */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3-Piece Asymmetric A/Trace Symbol + AstraFlow Wordmark */}
            <div className="inline-flex items-center gap-3.5 px-3 py-1.5 rounded-lg border border-[var(--af-border)]/80 bg-[var(--af-bg-surface)]/80 shadow-xs">
              <AstraFlowLogoMark width={32} height={26} className="shrink-0" />
              <div className="flex items-baseline gap-2.5">
                <span className="font-bold tracking-tight text-xl text-[var(--af-text-primary)] font-['Instrument_Sans',sans-serif]">
                  AstraFlow
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--af-accent)] font-semibold border-l border-[var(--af-border)] pl-2.5">
                  ENGINEERED CLARITY
                </span>
              </div>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--af-text-primary)] leading-[1.06]">
              {locale === "ar" ? (
                <>
                  معمارية تدفق صريحة لبيئة{" "}
                  <span className="text-[var(--af-accent)]">.NET</span>{" "}
                  بهندسة واضحة وموثوقة.
                </>
              ) : (
                <>
                  Explicit application flow for{" "}
                  <span className="text-[var(--af-accent)]">.NET</span>{" "}
                  built for inspectability.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--af-text-secondary)] leading-relaxed max-w-xl">
              {locale === "ar"
                ? "حزمة مكتبات نموذجية خالية من التبعيات الإجبارية للإرسال الوسيط، وتطابق الكائنات وقت التصريف، وتشخيصات OpenTelemetry الآمنة دون تسريب البيانات الحساسة."
                : "A modular, dependency-free suite for request dispatch, compile-time object projection, redaction-safe OpenTelemetry tracing, and runner-neutral assertions."}
            </p>

            {/* Editorial Statement */}
            <blockquote className="text-sm font-medium text-[var(--af-text-primary)] leading-relaxed italic border-l-2 border-[var(--af-copper)] pl-4 py-1">
              &ldquo;A .NET INFRASTRUCTURE FOR EXPLICIT, PREDICTABLE, AND INSPECTABLE FLOWS.&rdquo;
            </blockquote>

            {/* High-Craft Action Dock: CTA Buttons + CLI Command */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary CTA: Midnight Ink #0C1420 text on Ion Cyan #72D5DE (10.81:1 WCAG AAA) */}
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[var(--af-radius-control)] bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-af shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--af-focus)] cursor-pointer"
              >
                <span>{locale === "ar" ? "استكشف التوثيق" : "Explore Documentation"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/architecture"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[var(--af-radius-control)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-[var(--af-text-primary)] font-medium text-sm hover:border-[var(--af-accent)] active:scale-[0.98] transition-af focus-visible:outline-2 focus-visible:outline-[var(--af-focus)] cursor-pointer"
              >
                <span>{locale === "ar" ? "مخططات المعمارية" : "Architecture Hub"}</span>
              </Link>

              {/* Quick CLI Copy Pill */}
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center justify-between gap-2.5 px-3.5 py-3.5 rounded-[var(--af-radius-control)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-xs font-mono text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:border-[var(--af-accent)] active:scale-[0.98] transition-af cursor-pointer"
                title="Copy NuGet install command"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[var(--af-accent)]" />
                  <span className="hidden sm:inline">dotnet add package AstraFlow</span>
                  <span className="sm:hidden">dotnet add</span>
                </div>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[var(--af-text-subtle)]" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Architecture Window */}
          <div className="lg:col-span-6">
            <div className="rounded-[var(--af-radius-card)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] overflow-hidden shadow-xl ring-1 ring-[var(--af-border)]/50 backdrop-blur-md">
              {/* Window Title Bar */}
              <div className="px-4 py-3 bg-[var(--af-bg-canvas)] border-b border-[var(--af-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-border)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-border)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-border)]" />
                  </div>
                  <span className="ml-2 text-xs font-mono text-[var(--af-text-subtle)]">
                    AstraFlow.Runtime.Inspect
                  </span>
                </div>

                {/* Tab Switchers */}
                <div className="flex items-center gap-1 bg-[var(--af-bg-surface)] p-0.5 rounded border border-[var(--af-border)] text-xs font-mono">
                  <button
                    onClick={() => setActiveTab("dispatch")}
                    className={`px-2 py-1 rounded transition-af cursor-pointer ${
                      activeTab === "dispatch"
                        ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                        : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                    }`}
                  >
                    Dispatch
                  </button>
                  <button
                    onClick={() => setActiveTab("mapping")}
                    className={`px-2 py-1 rounded transition-af cursor-pointer ${
                      activeTab === "mapping"
                        ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                        : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                    }`}
                  >
                    Mapping
                  </button>
                  <button
                    onClick={() => setActiveTab("inspect")}
                    className={`px-2 py-1 rounded transition-af cursor-pointer ${
                      activeTab === "inspect"
                        ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
                        : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)]"
                    }`}
                  >
                    Telemetry
                  </button>
                </div>
              </div>

              {/* Code / Architecture Interactive Preview */}
              <div className="p-5 font-mono text-xs overflow-x-auto bg-[var(--af-bg-canvas)]/90 leading-relaxed min-h-[290px] flex flex-col justify-between">
                {activeTab === "dispatch" && (
                  <div className="space-y-2">
                    <div className="text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                      <span>// Zero-Unconstrained Reflection Dispatch</span>
                      <span className="text-[var(--af-accent)] font-semibold">IMediator.SendAsync</span>
                    </div>
                    <pre className="text-[var(--af-text-primary)]">
                      <code>{`// 1. Explicit command definition
public sealed record PlaceOrderCommand(Guid OrderId, decimal Amount) 
    : IRequest<OrderResult>;

// 2. Composable pipeline execution
var result = await mediator.SendAsync(
    new PlaceOrderCommand(orderId, 129.50m), 
    cancellationToken
);

// 3. Statically verified handler (AstraFlow.Analyzers checked)
public class PlaceOrderHandler : IRequestHandler<PlaceOrderCommand, OrderResult> {
    public Task<OrderResult> HandleAsync(...) => ...;
}`}</code>
                    </pre>
                  </div>
                )}

                {activeTab === "mapping" && (
                  <div className="space-y-2">
                    <div className="text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                      <span>// Compile-Time Source Generation &amp; EF Core</span>
                      <span className="text-[var(--af-accent)] font-semibold">32 B Allocation</span>
                    </div>
                    <pre className="text-[var(--af-text-primary)]">
                      <code>{`// 1. Direct typed source-generated mapping
public static partial class OrderMapper {
    [AstraGenerateMapping]
    public static partial OrderDto ToDto(OrderEntity entity);
}

// 2. Selective SQL projection expression for EF Core
var orders = await db.Orders
    .AsNoTracking()
    .Where(o => o.Status == OrderStatus.Completed)
    .ProjectTo<OrderEntity, OrderSummaryDto>()
    .ToListAsync(ct);`}</code>
                    </pre>
                  </div>
                )}

                {activeTab === "inspect" && (
                  <div className="space-y-2">
                    <div className="text-[var(--af-text-subtle)] pb-2 border-b border-[var(--af-border)] flex items-center justify-between">
                      <span>// Structured Telemetry &amp; Automatic Redaction</span>
                      <span className="text-[var(--af-copper)] font-semibold">ActivitySource Trace</span>
                    </div>
                    <pre className="text-[var(--af-text-primary)]">
                      <code>{`// Activity: Mediator.Dispatch.PlaceOrderCommand
SpanId:      e84f29a0b12c84
TraceId:     4bf92f3577b34da6a3ce929d0e0e4736
Allocations: 0 B
Duration:    0.85 ms

// Payload Sanitization (AstraFlow.Security)
CardNumber:  "•••• •••• •••• 4242"
CVV:         "[REDACTED_BY_POLICY]"
PiiStatus:   Safe`}</code>
                    </pre>
                  </div>
                )}

                {/* Footer Metrics Row */}
                <div className="pt-3 mt-3 border-t border-[var(--af-border)] flex items-center justify-between text-[11px] text-[var(--af-text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--af-success)]" />
                    <span>Compile-time verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--af-copper)]" />
                    <span>Redaction safe</span>
                  </div>
                  <div className="font-semibold text-[var(--af-accent)]">
                    16 Packages
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Pillars Mini-Dock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-[var(--af-border)]">
          <div className="p-4 rounded-lg bg-[var(--af-bg-surface)] border border-[var(--af-border)] hover:border-[var(--af-accent)] transition-af">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-accent)] font-semibold block mb-1">
              01 · MODULAR CORE
            </span>
            <h4 className="text-sm font-bold text-[var(--af-text-primary)] mb-1">
              Zero Unwanted Dependencies
            </h4>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              Adopt only what your application requires. `AstraFlow.Contracts` has zero dependencies; use Mediator without EF Core, or Mapper without Mediator.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--af-bg-surface)] border border-[var(--af-border)] hover:border-[var(--af-accent)] transition-af">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-copper)] font-semibold block mb-1">
              02 · COMPILE-TIME INSPECTION
            </span>
            <h4 className="text-sm font-bold text-[var(--af-text-primary)] mb-1">
              Roslyn Analyzers &amp; Generators
            </h4>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              Statically verifies handler completeness, duplicate registrations, and unmapped database properties in your IDE before code reaches production.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--af-bg-surface)] border border-[var(--af-border)] hover:border-[var(--af-accent)] transition-af">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-success)] font-semibold block mb-1">
              03 · DEFENSE-IN-DEPTH
            </span>
            <h4 className="text-sm font-bold text-[var(--af-text-primary)] mb-1">
              Redaction-Safe Diagnostics
            </h4>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              Enforce `[Redact]` attributes at API and telemetry boundaries so sensitive payment and PII fields never escape into OpenTelemetry spans or logs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
