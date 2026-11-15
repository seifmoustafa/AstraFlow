import { GITHUB_LINKS } from '@core/config/site-config';
import { readCommunitySourceDocuments } from './repository';
import { getContributionPathways } from './catalog';
import type { CommunityGovernance } from './model';

let cachedGovernance: CommunityGovernance | null = null;

export function getCommunityGovernance(): CommunityGovernance {
  if (cachedGovernance) return cachedGovernance;

  const { security, support } = readCommunitySourceDocuments();
  const slaMatch = security.match(/(\d+\s*hours)/i);
  const emailMatch = security.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const coffeeMatch = support.match(/https:\/\/buymeacoffee\.com\/[a-zA-Z0-9_-]+/);

  cachedGovernance = {
    buildTestCommands: [
      'dotnet restore AstraFlow.slnx',
      'dotnet build AstraFlow.slnx -c Release',
      'dotnet test AstraFlow.slnx -c Release',
    ],
    securityDisclosureEmail: emailMatch?.[0] ?? null,
    securitySlaHours: slaMatch?.[1] ?? '72 hours',
    buyMeACoffeeUrl: coffeeMatch?.[0] ?? GITHUB_LINKS.buyMeACoffee,
    pathways: getContributionPathways(),
  };

  return cachedGovernance;
}
