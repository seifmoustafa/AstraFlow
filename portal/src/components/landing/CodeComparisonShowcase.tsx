"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  Code2,
  Copy,
  Check,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  FileCode,
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
    legacyCode: `// Legacy Runtime Dynamic Mapping
public class OrderService
{
    private readonly IMapper _mapper; // Dynamic runtime profile lookup
    
    public async Task<List<OrderSummaryDto>> GetOrdersLegacy(AppDbContext db)
    {
        // Loads full entities with all columns into memory
        var entities = await db.Orders.AsNoTracking().ToListAsync();
        
        // Reflection-based property-by-property copy during runtime
        return _mapper.Map<List<OrderSummaryDto>>(entities);
    }
}`,
    astraFlowHighlight: "Zero runtime reflection, compile-time Roslyn verification, selective SQL SELECT query generation",
    legacyFlaw: "Over-fetching entire database tables, runtime type dictionary lookups, excessive memory churn",
  },
  {
    id: "assertions",
    name: "Runner-Neutral Assertions (v2.4)",
    badge: "Preview",
    title: "Privacy-Safe Assertions vs Leaky Test Framework Failures",
    description:
      "AstraFlow.Assertions (in development for v2.4.0) operates without package dependencies and automatically masks tokens, passwords, and sensitive identifiers in CI failure messages.",
    astraFlowCode: `// Runner-neutral assertion (zero package dependencies)
[Fact]
public void TokenPayload_Should_BeSanitizedInCiOutput()
{
    using var scope = new AssertionScope();
    
    var response = authClient.Authenticate("admin@corp.internal");
    
    // Privacy-safe failure formatting masks arbitrary values by default
    response.Token.Should().NotBeNullOrEmpty()
        .And.SubjectMatches("[a-zA-Z0-9_-]+");
    
    // If an assertion fails, CI logs show:
    // Expected token with valid claims, but found: [REDACTED_BEARER_TOKEN]
}`,
    legacyCode: `// Traditional Assertions Leaking Secrets in CI Logs
[Fact]
public void TokenPayload_LeakyFailure()
{
    var response = authClient.Authenticate("admin@corp.internal");
    
    // Traditional assertion prints raw unmasked payload on failure:
    Assert.True(response.Token == "expected_hash");
    
    // Failure output dumped to public CI job logs:
    // Expected: expected_hash
    // Actual:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [LEAKED_JWT_SECRET!]
}`,
    astraFlowHighlight: "Runner independence (xUnit/NUnit/MSTest), automatic secret masking, audit-safe CI output",
    legacyFlaw: "Dumps raw customer credentials and API keys directly into unencrypted CI runner logs",
  },
  {
    id: "security",
    name: "Security & Redaction",
    title: "Defense-in-Depth OpenTelemetry vs Plain-Text Tagging",
    description:
      "AstraFlow.Security sanitizes activity tags and diagnostic metadata before OpenTelemetry exporters broadcast spans across distributed tracing networks.",
    astraFlowCode: `// Telemetry sanitization gate
public class PaymentPipelineBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> HandleAsync(TRequest req, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        using var activity = AstraFlowDiagnostics.ActivitySource
            .StartActivity("Payment.Process");
        
        // Automatic policy-driven redaction for credit cards, SSNs, and API keys
        AstraFlowSecurity.RedactAndSetTag(activity, "user.email", "alice@customer.com");
        AstraFlowSecurity.RedactAndSetTag(activity, "payment.card", "4111111111114242");
        
        return await next(ct);
    }
}`,
    legacyCode: `// Insecure Telemetry Logging Anti-Pattern
public class LegacyPaymentLogger
{
    public void LogSpan(PaymentRequest request)
    {
        var activity = new Activity("Payment");
        
        // Directly writing unredacted PII to telemetry tags
        activity.SetTag("customer.email", request.Email);
        activity.SetTag("customer.credit_card", request.CardNumber);
        
        // Telemetry tags broadcast in plain-text to Jaeger, Zipkin, & Datadog!
    }
}`,
    astraFlowHighlight: "Guaranteed PII redaction, strict compliance defaults, zero telemetry data leakage",
    legacyFlaw: "Plain-text credential broadcasts in telemetry spans, violating GDPR and PCI-DSS compliance",
  },
];

export const CodeComparisonShowcase: React.FC = () => {
  const { locale } = usePortal();
  const [activeTabId, setActiveTabId] = useState<string>("mediator");
  const [copiedSide, setCopiedSide] = useState<"astraflow" | "legacy" | null>(null);

  const activeTab = comparisonTabs.find((t) => t.id === activeTabId) || comparisonTabs[0];

  const handleCopy = (code: string, side: "astraflow" | "legacy") => {
    navigator.clipboard.writeText(code);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl transition-all duration-300">
      {/* Top Header Dock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--af-border)] px-6 py-4 bg-[var(--af-bg-canvas)]/80 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--af-accent)]/15 border border-[var(--af-accent)]/30 text-[var(--af-accent)]">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--af-text-primary)]">
                Side-by-Side Architectural Code Matrix
              </h3>
              <span className="rounded-full bg-[var(--af-accent)]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--af-accent)] border border-[var(--af-accent)]/20">
                Pattern Comparison
              </span>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)]">
              Inspect how AstraFlow enforces typed predictability vs legacy reflection and leaky anti-patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Tab Selector */}
      <div className="flex border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] px-6 py-2.5 gap-2 overflow-x-auto scrollbar-none">
        {comparisonTabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? "bg-[var(--af-accent)]/10 text-[var(--af-accent)] border border-[var(--af-accent)]/30 font-semibold shadow-xs"
                  : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] border border-transparent"
              }`}
            >
              <span>{tab.name}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold" : "bg-[var(--af-surface-3)] text-[var(--af-text-subtle)]"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Split Comparison View */}
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h4 className="text-base font-bold text-[var(--af-text-primary)]">
            {activeTab.title}
          </h4>
          <p className="text-xs text-[var(--af-text-secondary)] mt-1 max-w-3xl leading-relaxed">
            {activeTab.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AstraFlow Modern Approach */}
          <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--af-accent)]" />
                  <span className="text-xs font-mono font-semibold text-[var(--af-text-primary)]">
                    AstraFlow Pattern (Typed & Inspectable)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(activeTab.astraFlowCode, "astraflow")}
                  className="flex items-center gap-1 text-[11px] text-[var(--af-accent)] hover:underline font-mono"
                >
                  {copiedSide === "astraflow" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedSide === "astraflow" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="p-4 font-mono text-xs text-[var(--af-text-primary)] bg-neutral-950 overflow-x-auto">
                <pre>
                  <code>{activeTab.astraFlowCode}</code>
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-[var(--af-border)] bg-[var(--af-bg-surface)]/60 flex items-start gap-2 text-xs text-[var(--af-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--af-success)] shrink-0 mt-0.5" />
              <span>{activeTab.astraFlowHighlight}</span>
            </div>
          </div>

          {/* Legacy / Reflection Anti-Pattern */}
          <div className="rounded-xl border border-[var(--af-border)]/60 bg-[var(--af-bg-canvas)] overflow-hidden flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity">
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--af-border)]/60 bg-[var(--af-bg-surface)]/60">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--af-danger)]" />
                  <span className="text-xs font-mono font-semibold text-[var(--af-text-secondary)]">
                    Legacy Reflection / Unsafe Pattern
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(activeTab.legacyCode, "legacy")}
                  className="flex items-center gap-1 text-[11px] text-[var(--af-text-subtle)] hover:underline font-mono"
                >
                  {copiedSide === "legacy" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedSide === "legacy" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="p-4 font-mono text-xs text-[var(--af-text-secondary)] bg-neutral-950/80 overflow-x-auto">
                <pre>
                  <code>{activeTab.legacyCode}</code>
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-[var(--af-border)]/60 bg-[var(--af-bg-surface)]/40 flex items-start gap-2 text-xs text-[var(--af-danger)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{activeTab.legacyFlaw}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
