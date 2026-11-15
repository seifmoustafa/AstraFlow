export {
  getAllDocs,
  getDocCategories,
  searchDocs,
} from '../data/service';
export { DOC_CATEGORY_ORDER, DOC_SLUG_ALIASES } from '../data/catalog';
export { searchDocSummaries } from '../data/search';
export type {
  DocCategory,
  DocCategoryGroup,
  DocDetail,
  DocNavLink,
  DocSummary,
} from '../data/model';
export {
  DocsHeroDesk,
  type DocsHeroDeskProps,
} from './views/DocsHeroDesk';
export {
  DocsSearch,
  type DocsSearchProps,
} from './views/DocsSearch';
export {
  default as DocsIndexPage,
  generateMetadata as docsIndexMetadata,
} from './views/DocsIndexPage';
export { CliCopyPill, type CliCopyPillProps } from '../article';
