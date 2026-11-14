export interface ContributionPathwayDefinition {
  id: ContributionPathwayId;
  number: string;
  href: string;
  isExternal: boolean;
}

export interface ContributionPathway extends ContributionPathwayDefinition {
  title: string;
  summary: string;
  detail: string;
  ctaLabel: string;
  tags: string[];
}

export type ContributionPathwayId =
  | 'source-repo'
  | 'issue-tracker'
  | 'pull-requests'
  | 'contributing-guide'
  | 'security-policy'
  | 'documentation-hub';

export interface CommunityGovernance {
  buildTestCommands: string[];
  securityDisclosureEmail: string | null;
  securitySlaHours: string;
  buyMeACoffeeUrl: string;
  pathways: ContributionPathwayDefinition[];
}
