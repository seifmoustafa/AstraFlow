import { highlightCode } from '@core/content/markdown';
import { RAW_MILESTONES } from './catalog';
import type { LearningMilestone } from './model';

let cachedMilestones: LearningMilestone[] | null = null;

export function getLearningMilestones(): LearningMilestone[] {
  if (!cachedMilestones) {
    cachedMilestones = RAW_MILESTONES.map((milestone) => ({
      ...milestone,
      codeHtml: highlightCode(milestone.code, milestone.codeLang),
    }));
  }
  return cachedMilestones;
}

export function getMilestoneById(id: string): LearningMilestone | null {
  return getLearningMilestones().find((milestone) => milestone.id === id) ?? null;
}
