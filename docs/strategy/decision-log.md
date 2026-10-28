# Strategic decisions and open gates

| ID | Decision | Status | Reason / reopen condition |
| --- | --- | --- | --- |
| D-01 | Optimize for dependable .NET application flow, not number of cloned packages | Proposed | Independent developer value must be measurable |
| D-02 | Keep explicit mapper and opt-in conventions separate | Existing invariant | Changing it is a breaking product change |
| D-03 | Prioritize generated mapper execution v2.1 | Proposed | Reopen on failed feasibility or negative build/security costs |
| D-04 | Preserve existing v2.2 supply-chain and v2.3 API-governance roadmap slots | Proposed | No silent roadmap commitment changes |
| D-05 | Consider generated mediator dispatch after v2.1 evidence | Candidate | Need runtime/DI inspection and head-to-head benchmarks |
| D-06 | Flow Intelligence starts with versioned manifest and CLI diff | Candidate | Need a useful consumer review flow |
| D-07 | Authentication stays outside AstraFlow | Proposed | Separate security ownership and maintenance |
| D-08 | Each integration requires a user problem and an owner | Proposed | Avoid framework sprawl and dependency leakage |

All decisions must be linked to source evidence and revised by new findings, not treated as permanent architectural dogma.
