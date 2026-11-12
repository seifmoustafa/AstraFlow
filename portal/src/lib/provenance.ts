export const PINNED_COMMIT_SHA = 'b163535864199bfb05cef62807d89509ac2239f8';

export type ProvenanceNotice =
  | 'Source milestone · Verify per package'
  | 'Unreleased · 2.4 Work in progress'
  | 'Umbrella verified in supplied evidence'
  | 'Governance / Policy'
  | 'Architecture Decision Record'
  | 'Strategy & Evidence Ledger'
  | 'Verify per package'
  | 'Source milestone, qualified status'
  | 'GitHub Release; NuGet unverified'
  | 'Work in progress / unreleased'
  | 'In development / unreleased'
  | 'Source milestone';
