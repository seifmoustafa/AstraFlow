"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  Code2,
  Copy,
  Check,
  Cpu,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface CodeComparisonTab {
  id: string;
  name: string;
  badge?: string;
  title: string;
  description: string;
  astraFlowCode: string;
  legacyCode: string;
  astraFlowHighlight: string;
  legacyFlaw: string;
}

const comparisonTabs: CodeComparisonTab[] = [
  {
    id: "mediator",
    name: "Mediator & Pipelines",
    title: "Explicit Request Dispatch vs Reflection Service Locator",
    description:
      "AstraFlow Mediator decouples callers from handlers with zero dynamic string reflection, explicit generic constraints, and composable IPipelineBehavior interceptors.",
    astraFlowCode: `// 1. Declare explicit typed command & response
public sealed record CreateInvoiceCommand(Guid OrderId, decimal Amount) 
    : IRequest<InvoiceResult>;

// 2. Composable pipeline behavior with cancellation propagation
public sealed class LoggingBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> HandleAsync(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken ct)
    {
        using var activity = AstraFlowDiagnostics.ActivitySource
            .StartActivity("Mediator.Pipeline");
        return await next(ct);
    }
}

// 3. Statically verified handler
public sealed class CreateInvoiceHandler 
    : IRequestHandler<CreateInvoiceCommand, InvoiceResult>
{
    public Task<InvoiceResult> HandleAsync(CreateInvoiceCommand request, CancellationToken ct)
        => Task.FromResult(new InvoiceResult(request.OrderId, "Issued"));
}`,
    legacyCode: `// Legacy / Reflection-Heavy Boilerplate
public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, InvoiceResult>
{
    private readonly IServiceProvider _provider; // Service locator anti-pattern
    
    public async Task<InvoiceResult> Handle(CreateInvoiceCommand cmd, CancellationToken ct)
    {
        // Dynamic reflection invoke on generic open types
        var pipeline = _provider.GetService(typeof(IPipelineBehavior<,>));
        var method = pipeline.GetType().GetMethod("Invoke");
        
        // Boxing, reflection invocation overhead & missing AOT support
        return (InvoiceResult)method.Invoke(pipeline, new object[] { cmd });
    }
}`,
    astraFlowHighlight: "Explicit static types, zero unconstrained reflection, compile-time AOT friendly",
    legacyFlaw: "Runtime reflection lookup, boxing allocations, uninspected pipeline failures",
  },
  {
    id: "mapping",
    name: "Compile-Time Mapping & EF",
    title: "Roslyn Source-Generated Mapping vs Runtime Reflection",
    description:
      "AstraFlow.Mapper creates typed mapper methods during compilation and transforms expression trees for EF Core without loading untracked entity graphs into memory.",
    astraFlowCode: `// 1. Source-generated typed mapper (AstraFlow.Generators)
public static partial class OrderMapper
{
    [AstraGenerateMapping]
    public static partial OrderDto ToDto(OrderEntity entity);
}

// 2. Direct EF Core query projection (AstraFlow.Mapper.EntityFrameworkCore)
public async Task<List<OrderSummaryDto>> GetRecentOrdersAsync(
    AppDbContext db, CancellationToken ct)
{
    return await db.Orders
        .AsNoTracking()
        .Where(o => o.Status == OrderStatus.Completed)
        .ProjectTo<OrderEntity, OrderSummaryDto>() // Generates selective SQL SELECT
        .ToListAsync(ct);
}`,
    legacyCode: `// Legacy Reflection-Based Mapping
public static class LegacyMapper
{
    public static TDest Map<TSource, TDest>(TSource source)
    {
        // Reflection scan over all property descriptors at runtime
        var dest = Activator.CreateInstance<TDest>();
        foreach (var prop in typeof(TSource).GetProperties())
        {
            var target = typeof(TDest).GetProperty(prop.Name);
            if (target != null && target.CanWrite)
                target.SetValue(dest, prop.GetValue(source)); // Slow & allocates
        }
        return dest;
    }
}`,
    astraFlowHighlight: "Direct IL / C# assignments, 32 B footprint, selective SQL SELECT projection",
    legacyFlaw: "Property reflection loops, boxing, forces client-side SQL evaluation in EF Core",
  },
  {
    id: "assertions",
    name: "Runner-Neutral Assertions",
    badge: "v2.4 Preview",
    title: "Clean-Room Fluent Chaining with Privacy-Safe Failure Output",
    description:
      "AstraFlow.Assertions (v2.4 in-dev) works identically across xUnit, NUnit, and MSTest without proprietary license walls, providing structured diffs that automatically mask PII.",
    astraFlowCode: `// AstraFlow.Assertions (Clean-Room v2.4 Preview)
[Fact]
public void Customer_Order_Should_Satisfy_Audit_Policy()
{
    var order = ProcessCustomerOrder(orderInput);

    // Fluent chaining with .And, .Which, and custom failure diagnostics
    order.Should().NotBeNull()
        .And.Subject.TotalAmount.Should().BeGreaterThan(0m);

    // Automatically sanitizes PII tokens in assertion failure messages
    order.PaymentDetails.Should()
        .ContainKey("AuthorizationCode")
        .Which.Should().MatchRegex("^[A-Z0-9]{8}$");
}`,
    legacyCode: `// Traditional Test Assertions
[Test]
public void Test_Legacy()
{
    var order = ProcessCustomerOrder(orderInput);

    // Disjointed assertions with opaque failure messages
    Assert.IsNotNull(order);
    Assert.IsTrue(order.TotalAmount > 0);
    
    // Leaks raw unredacted customer data into CI test logs
    Assert.AreEqual("AUTH9876", order.PaymentDetails["AuthCode"]);
    // Log failure: Expected AUTH9876 but got AUTH1234 for user john.doe@secret.com!
}`,
    astraFlowHighlight: "Fluent `.And` / `.Which` chaining, runner-neutral (xUnit/NUnit/MSTest), PII-masked CI logs",
    legacyFlaw: "Fragmented assert calls, unformatted failure dumps, potential PII leakage into test artifacts",
  },
  {
    id: "security",
    name: "Security & Redaction",
    title: "Defense-in-Depth Diagnostics & Automatic Data Masking",
    description:
      "AstraFlow.Security and AstraFlow.Diagnostics enforce safe diagnostic boundaries so sensitive request fields never escape into OpenTelemetry spans or error logs.",
    astraFlowCode: `// 1. Declare sensitive contract boundary
public sealed record ProcessPaymentCommand(
    Guid CustomerId,
    [property: Redact(MaskType.CreditCard)] string CardNumber,
    [property: Redact(MaskType.Secret)] string CVV,
    decimal Amount
) : IRequest<PaymentStatus>;

// 2. Telemetry subscriber writes safe structured payload
diagnosticListener.Subscribe(new AnonymousObserver<KeyValuePair<string, object?>>(
    evt =>
    {
        // Safe stringification enforces Redact attributes automatically
        var safeTrace = AstraFlowDiagnostics.FormatRedacted(evt.Value);
        logger.LogInformation("Pipeline Event: {Trace}", safeTrace);
        // Emits: {"CustomerId": "...", "CardNumber": "•••• 4242", "CVV": "[REDACTED]"}
    }
));`,
    legacyCode: `// Unsafe Traditional Tracing
public async Task<PaymentStatus> Handle(ProcessPaymentCommand cmd)
{
    // Careless JSON serialization into logger / OpenTelemetry tags
    var json = JsonSerializer.Serialize(cmd);
    _logger.LogInformation("Processing payment: {Payload}", json);
    
    // SECURITY RISK: Plaintext credit card numbers & CVV written to Splunk/Datadog!
    return await _gateway.ChargeAsync(cmd);
}`,
    astraFlowHighlight: "Declarative `[Redact]` attributes, compile-time Roslyn audit rule, zero-leak telemetry",
    legacyFlaw: "Unintentional PII/PCI exposure to log aggregators and APM telemetry pipelines",
  },
];

export function CodeComparisonShowcase() {
  const { locale } = usePortal();
  const [activeTabId, setActiveTabId] = useState<string>("mediator");
  const [copiedType, setCopiedType] = useState<"astra" | "legacy" | null>(null);

  const activeTab = comparisonTabs.find((t) => t.id === activeTabId) || comparisonTabs[0];

  const handleCopy = (code: string, type: "astra" | "legacy") => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <section className="py-20 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] mb-3">
              <GitCompare className="w-3.5 h-3.5" />
              <span>SHOWCASE 03 · SPLIT-VIEW CODE COMPARISON</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mb-3">
              {locale === "ar"
                ? "مصفوفة مقارنة الأكواد: AstraFlow مقابل الأنماط القديمة"
                : "Architectural Comparison: AstraFlow vs Legacy Approaches"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--af-text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "شاهد كيف تحل AstraFlow محل الصناديق السوداء القائمة على الانعكاس والترميز المعقد بحلول صريحة ومفحوصة وقت التجميع."
                : "Compare side-by-side: explicit, inspectable C# patterns versus reflection-heavy legacy code. Choose explicit correctness over runtime guesswork."}
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap items-center gap-2">
            {comparisonTabs.map((tab) => {
              const active = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-af cursor-pointer border ${
                    active
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold border-[var(--af-accent)]"
                      : "bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] border-[var(--af-border)] hover:border-[var(--af-text-secondary)]"
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--af-copper)]/20 text-[var(--af-copper)] border border-[var(--af-copper)]/40 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Context Banner */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--af-bg-canvas)] border border-[var(--af-border)]">
          <h3 className="text-base font-bold text-[var(--af-text-primary)] mb-1 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[var(--af-accent)]" />
            <span>{activeTab.title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-[var(--af-text-secondary)] leading-relaxed">
            {activeTab.description}
          </p>
        </div>

        {/* Split View Editor Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* AstraFlow Side */}
          <div className="flex flex-col rounded-[var(--af-radius-card)] bg-[var(--af-bg-canvas)] border border-[var(--af-accent)]/40 overflow-hidden shadow-sm">
            {/* Panel Header */}
            <div className="px-4 py-3 bg-[var(--af-bg-surface)] border-b border-[var(--af-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--af-accent)]" />
                <span className="text-xs font-mono font-bold text-[var(--af-text-primary)]">
                  The AstraFlow Way (Explicit &amp; Safe)
                </span>
              </div>
              <button
                onClick={() => handleCopy(activeTab.astraFlowCode, "astra")}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border border-[var(--af-border)] bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] transition-af cursor-pointer"
              >
                {copiedType === "astra" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy C#</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-[var(--af-text-primary)] leading-relaxed bg-[var(--af-bg-canvas)]">
              <pre className="select-all">
                <code>{activeTab.astraFlowCode}</code>
              </pre>
            </div>

            {/* Highlight Banner */}
            <div className="px-4 py-2.5 bg-[var(--af-accent)]/10 border-t border-[var(--af-border)] text-xs font-mono text-[var(--af-accent)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{activeTab.astraFlowHighlight}</span>
            </div>
          </div>

          {/* Legacy Boilerplate Side */}
          <div className="flex flex-col rounded-[var(--af-radius-card)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] overflow-hidden opacity-90 shadow-sm">
            {/* Panel Header */}
            <div className="px-4 py-3 bg-[var(--af-bg-surface)] border-b border-[var(--af-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-danger)]" />
                <span className="text-xs font-mono font-semibold text-[var(--af-text-secondary)]">
                  Legacy / Reflection Anti-Pattern
                </span>
              </div>
              <button
                onClick={() => handleCopy(activeTab.legacyCode, "legacy")}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border border-[var(--af-border)] bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] transition-af cursor-pointer"
              >
                {copiedType === "legacy" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-[var(--af-text-secondary)] leading-relaxed bg-[var(--af-bg-canvas)]">
              <pre className="select-all">
                <code>{activeTab.legacyCode}</code>
              </pre>
            </div>

            {/* Flaw Banner */}
            <div className="px-4 py-2.5 bg-[var(--af-danger)]/10 border-t border-[var(--af-border)] text-xs font-mono text-[var(--af-danger)] flex items-center gap-2">
              <span className="font-bold">Caution:</span>
              <span className="truncate">{activeTab.legacyFlaw}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
