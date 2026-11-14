/** Public documentation facade over the shared, browser-safe Markdown renderer. */
export {
  decodeBasicEntities,
  escapeHtml,
  highlightCode,
  normalizeCodeLanguage,
  renderMarkdown,
  rewriteMarkdownHref,
  slugifyHeading,
  stripHtmlTags,
} from '@core/content/markdown';
export type {
  CodeSnippet,
  RenderedMarkdown,
  RenderMarkdownOptions,
  TocItem,
} from '@core/content/markdown';
