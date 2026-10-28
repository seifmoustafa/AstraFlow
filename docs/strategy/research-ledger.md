# AstraFlow Research Ledger — Hypotheses, Not Feature Promises

**Status: Open research register.** Updated when experiments produce new evidence; replace hypotheses only with source links/measurements. A candidate does not enter release scope automatically.

| ID | Research question | Baseline / source to inspect | Evidence to collect | Promote/stop rule |
| --- | --- | --- | --- | --- |
| RES-01 | Can generated typed mapping improve runtime and AOT ergonomics? | Current mapper/generators, manual mapping, Mapster/Mapperly | Correctness, snapshots, build/runtime/AOT metrics | Promote narrow supported subset; stop if complexity dominates |
| RES-02 | Does generated mediator dispatch materially help? | Current cached dispatcher, direct call, generated mediators | Profiling, equal-pipeline performance, DI scope/AOT | Prefer optimizing current runtime if benefit small |
| RES-03 | Does a versioned flow manifest improve PR reviews? | Existing CLI report/diff/graph | Real consumer diff, false positives and cognitive load | Advance only if useful and accurate |
| RES-04 | Which mapping features save the most developer time? | Read DTO, record, nested, projection migration samples | Task completion time and errors | Prioritize verified friction, not competitor parity checklist |
| RES-05 | Which optional integration should ship first? | Two independent consumer scenarios per candidate | Boilerplate removed, failure complexity, maintenance cost | Admit only with owner and clear ROI |
| RES-06 | Is Better Auth-style DX compelling for .NET? | Better Auth UX, ASP.NET Identity/OpenIddict | Standards/maintenance threat model and adopter interviews | Separate product or defer |
| RES-07 | What should the support matrix be? | TFM/SDK assets, Microsoft support policies | Clean consumer and upgrade verification | Explicit support tiers in docs |
| RES-08 | Can sensitive-name heuristics cause false assurance? | Shared `AstraFlow.Security` and conventions | False negatives/positives and threat scenarios | Improve explicit policies; never claim automatic security |
| RES-09 | Which current licenses create adoption friction? | NuGet, vendor license pages, package changelogs | Date-stamped license eligibility and migration constraints | No clone purely because pricing changed |
| RES-10 | What stops external adoption? | Community feedback, issue discussions, real pilots | Onboarding minutes, docs problems, missing cases | Fix onboarding/quality before feature expansion |

## Research record format

Each study records **hypothesis, exact source SHA/package version, assumptions, representative workload, method, reproducibility instructions, findings (including unfavorable), risks, decision and revisit trigger**. Mark facts from source code separately from reasoning and market estimates.

## Prioritization scoring (qualitative, not arbitrary precision)

Score User Value (high/medium/low), Evidence Quality, Delivery Cost, Security/Operations Burden, Compatibility Risk and Differentiation. Default to the smallest experiment that could reject the hypothesis. Two low-evidence high-risk candidates do not become a single enormous roadmap milestone.

## Existing evidence boundaries

Source documentation confirms generated *registration* and mapping *metadata*; this does not confirm generated dispatch/mapping execution. Existing BenchmarkDotNet infrastructure does not prove fastest performance. Security-name classification does not certify confidentiality. Treat each unverified claim as a research question.

See [North Star](north-star.md), [Portfolio](ecosystem-portfolio.md), [Decision log](decision-log.md).
