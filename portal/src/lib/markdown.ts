import * as path from 'node:path';
import { Marked, Renderer, type Tokens } from 'marked';
import { GITHUB_URL } from './site-config';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface CodeSnippet {
  lang: string;
  code: string;
  html: string;
}

export interface RenderMarkdownOptions {
  /** Repo-relative POSIX source path, e.g. `docs/adr/0001-generated-mapper.md` or `README.md`. */
  sourcePath?: string;
  /** Canonical doc slug paths known to the portal, e.g. `getting-started`, `adr/0001-generated-mapper`. */
  docSlugs?: ReadonlySet<string>;
  /** Optional slug alias map, e.g. `quick-start` -> `getting-started`. */
  docAliases?: ReadonlyMap<string, string>;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocItem[];
  firstCodeSnippet: CodeSnippet | null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');
}

export function stripHtmlTags(html: string): string {
  return decodeBasicEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

export function slugifyHeading(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[`'’"]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'section';
}

function decodeHtmlEntitiesForUrlCheck(value: string): string {
  return decodeBasicEntities(value)
    .replace(/&#(\d+);?/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    });
}

function isDangerousUrl(rawHref: string): boolean {
  const decoded = decodeHtmlEntitiesForUrlCheck(rawHref);
  const compact = decoded
    .replace(/[\u0000-\u0020]+/g, '')
    .toLowerCase();
  return (
    compact.startsWith('javascript:') ||
    compact.startsWith('vbscript:') ||
    compact.startsWith('data:text/html') ||
    compact.startsWith('data:image/svg+xml')
  );
}

function sanitizeRawHtml(html: string): string {
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(
      /<(iframe|object|embed|form|input|button|textarea|select|svg|math|base|meta|link)\b[\s\S]*?(?:<\/\1>|\/?>)/gi,
      '',
    );

  // Remove inline event handlers (on*) and javascript:/vbscript:/unsafe data URLs in attributes
  cleaned = cleaned.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    '',
  );
  cleaned = cleaned.replace(
    /\s+(href|src|action|formaction|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (full, attrName: string, dq?: string, sq?: string, bare?: string) => {
      const value = dq ?? sq ?? bare ?? '';
      if (isDangerousUrl(value)) {
        return ` ${attrName}="#"`;
      }
      return full;
    },
  );

  return cleaned;
}

export function normalizeCodeLanguage(lang?: string): string {
  const raw = (lang ?? '').trim().toLowerCase().split(/\s+/)[0] ?? '';
  switch (raw) {
    case 'cs':
    case 'c#':
    case 'csharp':
      return 'csharp';
    case 'xml':
    case 'csproj':
    case 'props':
    case 'targets':
    case 'html':
    case 'config':
      return 'xml';
    case 'ps1':
    case 'pwsh':
    case 'powershell':
      return 'powershell';
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'shell':
    case 'console':
      return 'bash';
    case 'json':
    case 'jsonc':
      return 'json';
    case 'mermaid':
      return 'mermaid';
    case '':
    case 'text':
    case 'txt':
    case 'plaintext':
      return 'text';
    default:
      return raw.replace(/[^a-z0-9_-]/g, '') || 'text';
  }
}

function highlightWithPattern(
  code: string,
  pattern: RegExp,
  classify: (match: RegExpExecArray) => string | null,
): string {
  const out: string[] = [];
  let lastIndex = 0;
  pattern.lastIndex = 0;

  let match = pattern.exec(code);
  while (match !== null) {
    if (match.index > lastIndex) {
      out.push(escapeHtml(code.slice(lastIndex, match.index)));
    }

    const tokenText = match[0];
    if (tokenText.length === 0) {
      pattern.lastIndex += 1;
      match = pattern.exec(code);
      continue;
    }

    const cls = classify(match);
    if (cls) {
      out.push(`<span class="${cls}">${escapeHtml(tokenText)}</span>`);
    } else {
      out.push(escapeHtml(tokenText));
    }

    lastIndex = match.index + tokenText.length;
    match = pattern.exec(code);
  }

  if (lastIndex < code.length) {
    out.push(escapeHtml(code.slice(lastIndex)));
  }

  return out.join('');
}

/**
 * Deterministic single-pass syntax highlighter for C#, XML, PowerShell, Bash, and JSON.
 * Every token and gap is HTML-escaped safely.
 */
export function highlightCode(code: string, lang?: string): string {
  const normalized = normalizeCodeLanguage(lang);

  if (normalized === 'csharp') {
    const csharpPattern =
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(@"(?:""|[^"])*"|\$"(?:\\.|[^"\\])*"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b0x[0-9a-fA-F_]+\b|\b\d+(?:\.\d+)?(?:[fFdDmMuUlL]+)?\b)|(\b(?:abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|get|global|goto|if|implicit|in|init|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|partial|private|protected|public|readonly|record|ref|required|return|sbyte|sealed|set|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|when|where|while|with|yield)\b)|(\b[A-Z][A-Za-z0-9_]*\b)/g;

    return highlightWithPattern(code, csharpPattern, (m) => {
      if (m[1]) return 'tok-cm';
      if (m[2]) return 'tok-str';
      if (m[3]) return 'tok-num';
      if (m[4]) return 'tok-kw';
      if (m[5]) return 'tok-ty';
      return null;
    });
  }

  if (normalized === 'xml') {
    const xmlPattern =
      /(<!--[\s\S]*?-->)|(<\?[\s\S]*?\?>)|("(?:[^"]*)"|'(?:[^']*)')|(<\/?[A-Za-z_][A-Za-z0-9_.:-]*)|(\/?>)|(\b[A-Za-z_][A-Za-z0-9_.:-]*(?=\s*=))/g;

    return highlightWithPattern(code, xmlPattern, (m) => {
      if (m[1]) return 'tok-cm';
      if (m[2]) return 'tok-kw';
      if (m[3]) return 'tok-str';
      if (m[4] || m[5]) return 'tok-ty';
      if (m[6]) return 'tok-kw';
      return null;
    });
  }

  if (normalized === 'powershell' || normalized === 'bash') {
    const shellPattern =
      /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:[^']*)'|`[^`]*`)|(\$[A-Za-z_][A-Za-z0-9_:]*)|((?:^|[\s(])--?[A-Za-z][A-Za-z0-9-]*)|(\b(?:dotnet|astraflow|git|gh|cd|add|package|tool|install|restore|build|test|pack|run|inspect|validate|report|diff|graph|scan|verify|export|if|then|fi|for|in|do|done)\b)|(\b\d+(?:\.\d+)+\b|\b\d+(?:\.\d+)?\b)/gm;

    return highlightWithPattern(code, shellPattern, (m) => {
      if (m[1]) return 'tok-cm';
      if (m[2]) return 'tok-str';
      if (m[3]) return 'tok-ty';
      if (m[4] || m[5]) return 'tok-kw';
      if (m[6]) return 'tok-num';
      return null;
    });
  }

  if (normalized === 'json') {
    const jsonPattern =
      /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g;

    return highlightWithPattern(code, jsonPattern, (m) => {
      if (m[1] || m[3]) return 'tok-kw';
      if (m[2]) return 'tok-str';
      if (m[4]) return 'tok-num';
      return null;
    });
  }

  return escapeHtml(code);
}

/**
 * Rewrites repository-relative markdown and source links into portal routes or GitHub URLs.
 */
export function rewriteMarkdownHref(
  rawHref: string,
  options: RenderMarkdownOptions = {},
): { href: string; external: boolean; unsafe: boolean } {
  const href = rawHref.trim();
  if (!href || isDangerousUrl(href)) {
    return { href: '#', external: false, unsafe: Boolean(href) };
  }

  if (href.startsWith('#')) {
    return { href, external: false, unsafe: false };
  }

  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
    return { href, external: !href.startsWith('mailto:'), unsafe: false };
  }

  if (href.startsWith('/')) {
    return { href, external: false, unsafe: false };
  }

  const hashIndex = href.indexOf('#');
  const rawPath = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';

  const sourcePath = (options.sourcePath ?? 'docs/overview.md').replace(
    /\\/g,
    '/',
  );
  const baseDir = path.posix.dirname(sourcePath);
  const resolved = path.posix
    .normalize(baseDir === '.' ? rawPath : path.posix.join(baseDir, rawPath))
    .replace(/^\.\//, '');

  // Escaping above repository root isn't valid locally
  if (resolved.startsWith('..')) {
    return { href: `${GITHUB_URL}${hash}`, external: true, unsafe: false };
  }

  const lower = resolved.toLowerCase();
  if (lower === 'changelog.md') {
    return { href: `/changelog${hash}`, external: false, unsafe: false };
  }

  if (lower === 'readme.md') {
    return { href: `/docs/overview${hash}`, external: false, unsafe: false };
  }

  if (lower.startsWith('docs/') && lower.endsWith('.md')) {
    const candidateSlug = resolved.slice('docs/'.length, -'.md'.length);
    const aliased = options.docAliases?.get(candidateSlug.toLowerCase());
    const finalSlug = aliased ?? candidateSlug;
    if (!options.docSlugs || options.docSlugs.has(finalSlug)) {
      return { href: `/docs/${finalSlug}${hash}`, external: false, unsafe: false };
    }
  }

  const isDirectoryRef = rawPath.endsWith('/');
  const githubTarget = isDirectoryRef
    ? `${GITHUB_URL}/tree/main/${resolved.replace(/\/+$/, '')}${hash}`
    : `${GITHUB_URL}/blob/main/${resolved}${hash}`;

  return { href: githubTarget, external: true, unsafe: false };
}

/**
 * Safely renders repository Markdown into sanitized HTML with deterministic heading IDs,
 * extracted TOC entries, custom syntax highlighting, and rewritten internal links.
 */
export function renderMarkdown(
  source: string,
  options: RenderMarkdownOptions = {},
): RenderedMarkdown {
  const toc: TocItem[] = [];
  const headingCounts = new Map<string, number>();
  let firstCodeSnippet: CodeSnippet | null = null;
  const fallbackRenderer = new Renderer();

  const marked = new Marked({
    gfm: true,
    breaks: false,
  });

  marked.use({
    renderer: {
      heading(token: Tokens.Heading): string {
        const inlineHtml = this.parser.parseInline(token.tokens);
        const plainText = stripHtmlTags(inlineHtml);
        const base = slugifyHeading(plainText);

        let id = base;
        const count = headingCounts.get(base) ?? 0;
        if (count > 0 || headingCounts.has(base)) {
          let suffix = count === 0 ? 1 : count;
          while (headingCounts.has(`${base}-${suffix}`)) {
            suffix += 1;
          }
          id = `${base}-${suffix}`;
          headingCounts.set(base, suffix + 1);
          headingCounts.set(id, 1);
        } else {
          headingCounts.set(base, 1);
        }

        if (token.depth >= 2 && token.depth <= 4 && plainText) {
          toc.push({
            id,
            text: plainText,
            level: token.depth,
          });
        }

        return `<h${token.depth} id="${escapeHtml(id)}">${inlineHtml}</h${token.depth}>\n`;
      },

      code(token: Tokens.Code): string {
        const normalizedLang = normalizeCodeLanguage(token.lang);
        const highlighted = highlightCode(token.text, normalizedLang);
        const blockHtml = `<pre class="code-block" data-lang="${escapeHtml(normalizedLang)}"><code class="language-${escapeHtml(normalizedLang)}">${highlighted}</code></pre>\n`;

        if (firstCodeSnippet === null && token.text.trim().length > 0) {
          firstCodeSnippet = {
            lang: normalizedLang,
            code: token.text,
            html: highlighted,
          };
        }

        return blockHtml;
      },

      html(token: Tokens.HTML | Tokens.Tag): string {
        return sanitizeRawHtml(token.text);
      },

      link(token: Tokens.Link): string {
        const labelHtml = this.parser.parseInline(token.tokens);
        const { href, external, unsafe } = rewriteMarkdownHref(
          token.href ?? '',
          options,
        );
        if (unsafe) {
          return labelHtml;
        }
        const titleAttr = token.title
          ? ` title="${escapeHtml(token.title)}"`
          : '';
        const externalAttrs = external
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        return `<a href="${escapeHtml(href)}"${titleAttr}${externalAttrs}>${labelHtml}</a>`;
      },

      image(token: Tokens.Image): string {
        const rawSrc = (token.href ?? '').trim();
        const alt = token.text || 'Repository diagram';
        if (!rawSrc || isDangerousUrl(rawSrc)) {
          return escapeHtml(alt);
        }

        if (!/^https?:\/\//i.test(rawSrc) && !rawSrc.startsWith('/')) {
          const { href } = rewriteMarkdownHref(rawSrc, options);
          return `<p class="md-asset-ref"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">View repository media: ${escapeHtml(alt)} ↗</a></p>\n`;
        }

        const titleAttr = token.title
          ? ` title="${escapeHtml(token.title)}"`
          : '';
        return `<img src="${escapeHtml(rawSrc)}" alt="${escapeHtml(alt)}"${titleAttr} loading="lazy" />`;
      },

      table(token: Tokens.Table): string {
        const tableHtml = fallbackRenderer.table.call(this, token);
        return `<div class="md-table-wrap">${tableHtml}</div>\n`;
      },
    },
  });

  const html = marked.parse(source, { async: false });
  return {
    html,
    toc,
    firstCodeSnippet,
  };
}
