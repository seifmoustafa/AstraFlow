"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export function HeroSection() {
  const { t, locale } = usePortal();
  const [copied, setCopied] = useState(false);

  const installCmd = "dotnet add package AstraFlow --version 2.3.0";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
      {/* Precision Background Grid & Dual Flow Trace Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30 overflow-hidden" aria-hidden="true">
        {/* Subtle engineering coordinate grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(var(--af-border) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 50% 20%, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 20%, black 40%, transparent 80%)",
          }}
        />

        {/* Dual Thin Flow Trace SVG Path */}
        <svg
          className="absolute w-full h-full left-0 top-0"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Primary Ion Cyan Trace (#72D5DE) */}
          <path
            d="M -100 280 C 300 240, 500 420, 850 310 C 1100 230, 1300 360, 1550 320"
            stroke="var(--af-accent)"
            strokeWidth="1.25"
            strokeDasharray="6 6"
            className="opacity-40 dark:opacity-50"
          />
          {/* Secondary Trace */}
          <path
            d="M -50 320 C 350 390, 650 210, 950 260 C 1200 300, 1350 210, 1500 240"
            stroke="var(--af-accent)"
            strokeWidth="0.75"
            className="opacity-25 dark:opacity-35"
          />

          {/* Micro-nodes: <5% area accent nodes */}
          <circle cx="850" cy="310" r="3.5" fill="var(--af-accent)" />
          {/* Warm Copper Micro-Node (#D9A477 / #9A601B) */}
          <circle cx="950" cy="260" r="3" fill="var(--af-copper)" />
        </svg>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Status & Verification Pill */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          {/* Stable Version Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--af-border)] bg-[var(--af-bg-surface)] text-xs font-mono text-[var(--af-text-primary)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--af-success)]" />
            <span className="font-semibold text-[var(--af-accent)]">v2.3.0</span>
            <span className="text-[var(--af-text-secondary)]">{locale === "ar" ? "مستقر ومنشور" : "Stable Published"}</span>
          </div>

          {/* Preview / In-Dev Badge - Strict Product Truth */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--af-copper)]/30 bg-[var(--af-copper)]/10 text-xs font-mono text-[var(--af-copper)]">
            <Sparkles className="w-3 h-3" />
            <span>v2.4.0 Preview</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">
              ({locale === "ar" ? "تأكيدات ومطابقة مولّدة" : "Assertions & Generated Mapping"})
            </span>
          </div>

          {/* Target Framework Support Tag (design.md 10.3) */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[var(--af-text-secondary)] border border-[var(--af-border)] bg-[var(--af-bg-surface)]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--af-accent)]" />
            <span>netstandard2.0 · .NET 8, 9 &amp; 10</span>
          </div>
        </div>

        {/* Pattern A Editorial Lockup: Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-12">
          {/* Left Column: Visual Brand Mark + Engineered Clarity Headline */}
          <div className="lg:col-span-7">
            {/* 3-Piece Asymmetric A/Trace Symbol + AstraFlow Wordmark */}
            <div className="flex items-center gap-3.5 mb-5">
              <AstraFlowLogoMark width={34} height={27} className="shrink-0" />
              <div className="flex items-baseline gap-2.5">
                <span className="font-bold tracking-tight text-xl text-[var(--af-text-primary)] font-['Instrument_Sans',sans-serif]">
                  AstraFlow
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--af-accent)] font-semibold border-l border-[var(--af-border)] pl-2.5">
                  ENGINEERED CLARITY
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--af-text-primary)] leading-[1.08] mb-6">
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

            {/* Core Subtitle */}
            <p className="text-base sm:text-lg text-[var(--af-text-secondary)] leading-relaxed max-w-2xl">
              {locale === "ar"
                ? "حزمة مكتبات نموذجية خالية من التبعيات الإجبارية للإرسال الوسيط، وتطابق الكائنات وقت التصريف، وتشخيصات OpenTelemetry الآمنة دون تسريب البيانات الحساسة."
                : "A modular, dependency-free suite for request dispatch, compile-time object projection, redaction-safe OpenTelemetry tracing, and runner-neutral assertions."}
            </p>
          </div>

          {/* Right Column: Editorial Statement & Technical Principles */}
          <div className="lg:col-span-5 lg:border-l lg:border-[var(--af-border)] lg:pl-10 flex flex-col justify-between h-full pt-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[var(--af-accent)]" />
                <span>{locale === "ar" ? "بيان التصميم المعماري" : "ARCHITECTURAL STATEMENT"}</span>
              </div>
              <blockquote className="text-sm sm:text-base font-medium text-[var(--af-text-primary)] leading-relaxed italic border-l-2 border-[var(--af-copper)] pl-3.5 mb-6">
                &ldquo;A .NET INFRASTRUCTURE FOR EXPLICIT, PREDICTABLE, AND INSPECTABLE FLOWS.&rdquo;
              </blockquote>
              <p className="text-xs sm:text-sm text-[var(--af-text-secondary)] leading-relaxed mb-6">
                {locale === "ar"
                  ? "تجنب السحر والتخمين والغموض في وقت التشغيل. في AstraFlow، كل معالج مسار صريح، وكل إسقاط قاعدة بيانات مفحوص برمجياً، وكل قياس تتبعي محمي ضد كشف الأسرار."
                  : "Zero reflection black boxes. In AstraFlow, every request pipeline is statically inspectable, every database projection is Roslyn-verified, and every diagnostic activity preserves redaction boundaries."}
              </p>
            </div>

            {/* Quick 3 Architectural Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--af-border)] font-mono text-xs">
              <div>
                <span className="text-[10px] text-[var(--af-text-subtle)] block uppercase">Mapping</span>
                <span className="font-semibold text-[var(--af-text-primary)]">32 B Alloc</span>
                <span className="text-[10px] text-[var(--af-text-secondary)] block">generated DTO</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--af-text-subtle)] block uppercase">Safety</span>
                <span className="font-semibold text-[var(--af-text-primary)]">Redaction</span>
                <span className="text-[10px] text-[var(--af-text-secondary)] block">by default</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--af-text-subtle)] block uppercase">Ecosystem</span>
                <span className="font-semibold text-[var(--af-text-primary)]">16 Packages</span>
                <span className="text-[10px] text-[var(--af-text-secondary)] block">modular design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row: Primary Button (Dark Ink text on Ion Cyan) + Secondary CTA + CLI Copy Command */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pt-4 border-t border-[var(--af-border)]">
          {/* Primary CTA Button: Mandated Midnight Ink #0C1420 on Ion Cyan #72D5DE */}
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--af-radius-control)] bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-af shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--af-focus)] cursor-pointer"
          >
            <span>{locale === "ar" ? "استكشف التوثيق الشامل" : "Explore Documentation"}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>

          {/* Secondary CTA Button */}
          <Link
            href="/architecture"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--af-radius-control)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-[var(--af-text-primary)] font-medium text-sm hover:border-[var(--af-accent)] active:scale-[0.98] transition-af focus-visible:outline-2 focus-visible:outline-[var(--af-focus)] cursor-pointer"
          >
            <span>{locale === "ar" ? "المعمارية ومخططات Archify" : "Architecture & Archify Hub"}</span>
          </Link>

          {/* Interactive dotnet CLI Install Command with Copy Feedback */}
          <div className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-[var(--af-radius-control)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-xs font-mono text-[var(--af-text-primary)] shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Terminal className="w-4 h-4 text-[var(--af-accent)] shrink-0" />
              <span className="truncate select-all">{installCmd}</span>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              aria-label="Copy install command"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--af-bg-canvas)] border border-[var(--af-border)] text-[11px] font-mono text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:border-[var(--af-accent)] active:scale-95 transition-af cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
                  <span className="text-[var(--af-success)]">{locale === "ar" ? "تم النسخ" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "نسخ" : "Copy"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
