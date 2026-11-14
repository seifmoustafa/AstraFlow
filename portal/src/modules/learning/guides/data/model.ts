export type LearningMilestoneId =
  | 'contracts'
  | 'mediator-pipelines'
  | 'explicit-mapping'
  | 'source-generators'
  | 'diagnostics-cli'
  | 'testing-harnesses';

export interface LearningMilestone {
  stepNumber: string;
  id: LearningMilestoneId;
  packages: string[];
  codeLang: 'csharp' | 'xml' | 'bash';
  codeTitle: string;
  code: string;
  codeHtml: string;
  docHref: string;
  secondaryLinkHrefs: string[];
}

export interface LearningMilestoneCopy {
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  keyConcepts: string[];
  docLabel: string;
  secondaryLabels: string[];
}

export interface PresentedLearningMilestone extends LearningMilestone {
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  keyConcepts: string[];
  docLabel: string;
  secondaryLinks: { href: string; label: string }[];
}

export type RawMilestone = Omit<LearningMilestone, 'codeHtml'>;
