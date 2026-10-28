# ADR-0001 — Executable Generated Object Mapping

**Status:** Proposed; **not** an API decision or shipped feature.  
**Primary target:** v2.1.0 design spike and vertical slice.  
**Owners:** Maintainer to assign. **Reviewed against:** repository documentation, not a complete implementation audit.

## Problem statement

AstraFlow has explicit mapper rules, opt-in convention profiles, projections and generated mapping/projection **metadata**. It does not yet document a generated typed object-conversion **execution** engine. The immediate opportunity is to move correctness feedback earlier, make static mapping code reviewable, and quantify runtime/AOT benefit without breaking existing users.

### Requirements
- **R1: Compatibility.** Existing `IMapper`, `IObjectMappingRule`, `IDeclaredObjectMappingRule`, validation, package boundaries and opt-in conventions must remain available.
- **R2: Explicit opt-in.** Merely installing the generator must not create mappings or change runtime rule selection.
- **R3: Readability.** A consumer can inspect generated C# that clearly assigns each destination member.
- **R4: Strong diagnostics.** Unsupported shapes yield source-located diagnostics with stable IDs, severity and fix guidance.
- **R5: Secure semantics.** No silent sensitive member copies, unsafe narrowing or uninitialized required members.
- **R6: Determinism.** Same compilation input means the same generated output; incremental edits do not corrupt other maps.
- **R7: Known runtime cost.** Measure allocations, startup, build overhead, AOT viability and generated code size.
- **R8: Honest boundary.** Compiler-visible declarations are not equivalent to arbitrary runtime delegates, profiles or service-resolved policies.

## Source-level constraints verified before the spike

At repository base `main` SHA `d078e34`, [`AstraFlowObjectMapper`](../../src/AstraFlow.Mapper/AstraFlowObjectMapper.cs) performs null handling, assignable-source identity return and collection mapping **before** rule matching; then scans scoped `IObjectMappingRule` services and fails on missing/duplicate rules. [`AstraFlowMapperRegistration`](../../src/AstraFlow.Mapper/AstraFlowMapperRegistration.cs) wires `IMapper` and rules scoped. A generated typed method does not automatically inherit these facade semantics.

**Required design decision:** distinguish *generated direct mapping contract* (which may deliberately construct a new DTO) from *adapter-through-IMapper contract* (which must honor the facade's identity/collection and precedence semantics). Test both if both are shipped. Do not register a singleton generated rule or bypass existing pair validation.

[`AstraFlowMapperMetadataGenerator`](../../src/AstraFlow.Generators/AstraFlowMapperMetadataGenerator.cs) is an `IIncrementalGenerator` fed by `CompilationProvider.Select` and walks the compilation to discover types. A new generator must **measure** incremental edit cost; do not assume Roslyn's interface ensures fine-grained incremental work.

## Candidate APIs (examples, NOT public AstraFlow APIs)

**Option A — Partial mapping method:**

```csharp
public static partial class OrderMaps
{
    [AstraGenerateMapping] // illustrative symbol, not currently shipped
    public static partial OrderDto ToDto(OrderEntity source);
}
```

**Option B — Declared type pair:**

```csharp
[AstraGenerateMap(typeof(OrderEntity), typeof(OrderDto))] // illustrative
public partial class ApplicationMappingCatalog { }
```

| Criterion | Partial method | Pair catalog |
| --- | --- | --- |
| Discoverability | Direct type-safe call site | Central ownership list |
| API cost | Partial-method attribute and constraints | Generated type/registration naming |
| Duplicate rules | By declaration and optional DI adapter | By catalog and optional adapter |
| AOT posture | Direct typed method potentially ideal | Depends on generated invocation API |
| Existing rule compatibility | Adapter may be necessary | Adapter may be necessary |
| Decision | **Preferred experiment**, not final | Compare during source audit |

**Decision process:** inspect actual compiler target and existing mapper registration; prototype both with one sample; select **one** additive surface or reject generation if neither is maintainable. Do not publish dual DSLs in the first release.

## Behavioral contract: v2.1 minimum

| Mapping aspect | Required behavior |
| --- | --- |
| Source | Accessible named type in compilation/reference metadata |
| Destination | Accessible constructible mutable class/struct with compatible members |
| Member match | Exact-name and statically assignable scalar property; *no implicit convention scan of every pair* |
| Missing destination required member | Diagnostic; no silent default |
| Nullable source/member | Document exact semantics; compile diagnostic if semantics cannot be guaranteed |
| Type mismatch | Explicit error; no lossy numeric/enum conversion |
| Sensitive member | Block/require explicit compile-visible allowance under selected policy |
| Duplicate pair | Error by default; no `last registration wins` |
| Nested object | Unsupported or separately declared explicit map; no automatic deep traversal |
| Constructor/record | **Stretch**, only after determinism and required-member semantics are proven |
| Update mapping / reverse map | Out of scope; especially no convention domain writes |
| EF projection | Not generated SQL; existing IQueryable abstractions unchanged |

### Generated output contract
- Generated names are stable and collision-free for supported type identifiers and generic parameters.
- Escape C# keywords and fully qualify emitted type references.
- Do not generate reflection hooks, arbitrary dynamic invocation or external runtime dependencies to make the fast path work.
- Avoid embedding potentially sensitive member **values**, request data or secrets; member names/type info are metadata and may still require redaction in reports.
- Generator failure must be actionable, not a production build crash with opaque stack traces.
- No implicit global policies that are invisible to the compilation.

## Runtime interaction and precedence

Three existing/new routes remain distinct:
1. Existing explicit mapping rules and opt-in convention profiles keep their current semantics.
2. Generated **typed direct method** executes generated assignments and is benchmarked as its own call form.
3. A future **optional** generated-to-`IMapper` adapter is possible only after confirming existing validation, DI scope/ordering and duplicate behavior; typed and adapter calls are measured separately.

Do **not** silently register a generated pair over an explicit rule, and do not auto-replace a runtime rule when installing analyzers. A strict generated-only configuration must fail on unsupported shapes; a future explicit mixed-mode policy, if wanted, requires an ADR extension with diagnostics that expose which mode actually ran.

## Security and static-analysis limitations

A sensitive-name taxonomy catches likely names, not all secrets. No member name heuristic proves that a DTO is safe. Support compile-visible allow/deny metadata where justified; runtime authorization and domain invariants stay with the application. A mapping from public DTO to domain entity is a different security question from generating a read DTO. Do not weaken reverse/update protections to improve ergonomics.

## Alternative evaluation

| Alternative | Benefit | Failure risk / trade-off |
| --- | --- | --- |
| Optimize runtime mapper only | Minimal new API | Does not offer an inspectable generated typed method |
| Generate all runtime profiles | Feature parity impression | Compiler cannot reliably know runtime services, closures, transform order |
| New independent mapping DSL | Simple generator authoring | Fragments public APIs and doubles maintenance |
| Generated typed method + narrow support | Clear behavior and testability | Added source size/build cost; subset limitations |
| Manual mapping only | Maximum predictability | Repeated boilerplate, limited automated diagnostics |

## Validation and release gates

**Compiler:** snapshots; repeated builds; incremental edits; cancellation; duplicate overloads/type names; inaccessible members; source-linked diagnostics; supported compiler/language versions.

**Mapping:** happy path; required members; exact vs case names; missing members; null source; nullable values; ambiguous constructor; enum/numeric mismatches; collection/nested unsupported cases; record/init handling if promoted.

**Security:** sensitive field blocked; explicitly authorized path only if supported; null/secret leakage through errors and exported plans; negative write policy tests.

**DI and runtime:** no generator reference leaves old samples unchanged; duplicate rules detected; scope and disposal correct where adapter exists; differential parity for shared supported semantics.

**Deployment:** clean PackageReference consumer; package compiler asset verification; Native AOT **publish AND execute**; trim-warning review; no unintended reflection.

**Performance:** manual mapping, existing AstraFlow, typed generated AstraFlow, optional interface adapter, AutoMapper/Mapster/Mapperly where comparable; same workload; include clean/incremental build and binaries.

## Consequences and open questions

+ Gains inspectable static execution, earlier feedback, potential AOT and runtime benefits.
- Adds generator maintenance, compiler APIs, build-time cost, emitted code size and user education.
- Does not solve arbitrary runtime configuration or guarantee global performance superiority.

**Open before implementation:** exact public declaration, diagnostics ID ownership, source-generation symbol discovery across referenced assemblies, runtime adapter ownership, strict-mode configuration, supported C# / TFM matrix, policy semantics.

**Promotion rule:** a source-audited prototype and a clean consumer must pass before the API becomes committed. [Release plan](../plans/v2.1-generated-mapping.md) governs the single release.
