import * as fs from 'node:fs';
import * as path from 'node:path';

let cachedRepoRoot: string | null = null;

function isAstraFlowRepoRoot(candidate: string): boolean {
  return (
    fs.existsSync(path.join(candidate, 'Directory.Build.props')) &&
    fs.existsSync(path.join(candidate, 'src')) &&
    fs.existsSync(path.join(candidate, 'docs')) &&
    fs.existsSync(path.join(candidate, 'CHANGELOG.md'))
  );
}

/**
 * Resolves the AstraFlow repository root directory regardless of whether
 * Node is running with cwd set to `portal/` or the repository root.
 */
export function getRepoRoot(): string {
  if (cachedRepoRoot && isAstraFlowRepoRoot(cachedRepoRoot)) {
    return cachedRepoRoot;
  }

  const checked: string[] = [];
  const envRoot = process.env.ASTRAFLOW_REPO_ROOT;
  if (envRoot) {
    const resolvedEnv = path.resolve(envRoot);
    checked.push(resolvedEnv);
    if (isAstraFlowRepoRoot(resolvedEnv)) {
      cachedRepoRoot = resolvedEnv;
      return resolvedEnv;
    }
  }

  let current = path.resolve(process.cwd());
  for (let depth = 0; depth < 8; depth += 1) {
    checked.push(current);
    if (isAstraFlowRepoRoot(current)) {
      cachedRepoRoot = current;
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error(
    `Unable to locate AstraFlow repository root from cwd "${process.cwd()}". Checked: ${checked.join(', ')}`,
  );
}

/**
 * Resolves an absolute path inside the AstraFlow repository root.
 */
export function resolveRepoPath(...segments: string[]): string {
  return path.join(getRepoRoot(), ...segments);
}

/**
 * Resolves the Next.js portal root directory.
 */
export function getPortalRoot(): string {
  return resolveRepoPath('portal');
}

/**
 * Reads a UTF-8 repository text file with normalized LF line endings and stripped BOM.
 */
export function readRepoText(...segments: string[]): string {
  const fullPath = resolveRepoPath(...segments);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}
