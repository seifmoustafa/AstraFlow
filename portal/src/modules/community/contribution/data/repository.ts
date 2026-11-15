import { readRepoText } from '@core/server/repo-paths';

export interface CommunitySourceDocuments {
  contributing: string;
  security: string;
  support: string;
  codeOfConduct: string;
}

/** Reads maintainer-authored source documents used by the community page. */
export function readCommunitySourceDocuments(): CommunitySourceDocuments {
  return {
    contributing: readRepoText('CONTRIBUTING.md'),
    security: readRepoText('SECURITY.md'),
    support: readRepoText('SUPPORT.md'),
    codeOfConduct: readRepoText('CODE_OF_CONDUCT.md'),
  };
}
