import { expect, test } from '@playwright/test';
import {
  DOC_SLUG_ALIASES,
  getAllDocRouteParams,
  getAllDocs,
  getDocBySlug,
  getDocCategories,
  searchDocs,
  searchDocSummaries,
} from '../src/modules/documentation/data';

test('documentation index keeps canonical routes, aliases, navigation, and categories aligned', () => {
  const docs = getAllDocs();
  const slugPaths = docs.map((doc) => doc.slugPath);
  const routeParams = getAllDocRouteParams().map((route) => route.slug.join('/'));

  expect(docs.length).toBeGreaterThan(0);
  expect(new Set(slugPaths).size).toBe(docs.length);
  expect(routeParams).toEqual(expect.arrayContaining(slugPaths));

  for (const [alias, target] of DOC_SLUG_ALIASES) {
    const resolved = getDocBySlug(alias);
    expect(routeParams).toContain(alias);
    expect(resolved?.slugPath).toBe(target);
  }

  const categorizedDocs = getDocCategories().flatMap((group) => group.docs);
  expect(categorizedDocs.map((doc) => doc.slugPath).sort()).toEqual(
    [...slugPaths].sort(),
  );
  expect(docs[0]?.prev).toBeNull();
  expect(docs.at(-1)?.next).toBeNull();
});

test('server and interactive documentation search use the same ranking and category filter', () => {
  const docs = getAllDocs();
  const queries = ['', 'mapper', 'projection validation', 'exceptions', 'no match'];

  for (const query of queries) {
    expect(searchDocs(query)).toEqual(searchDocSummaries(docs, query));
  }

  for (const category of getDocCategories().map((group) => group.category)) {
    expect(searchDocSummaries(docs, 'mapper', category)).toEqual(
      searchDocSummaries(
        docs.filter((doc) => doc.category === category),
        'mapper',
      ),
    );
  }
});

test('documentation search includes technical details beyond the article preview excerpt', () => {
  expect(searchDocs('xml declaration').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
});

test('Assertions guide indexes nullable, stream, timeout, and exception APIs', () => {
  const assertions = getDocBySlug('assertions');
  expect(assertions).not.toBeNull();

  const searchableGuide = assertions?.searchText ?? '';
  for (const term of [
    'nullable t? assertions',
    'netstandard2.0',
    'net8.0',
    'net9.0',
    'net10.0',
    'notbeoneof',
    'bedefined',
    'notbedefined',
    'haveflag',
    'nothaveflag',
    'nullable enums add',
    'beapproximately',
    'befinite',
    'completewithinasync',
    'notcompletewithinasync',
    'zero is a valid timeout',
    'pre-canceled token also prevents invocation',
    'cancellation stops only the assertion wait',
    'synchronous blocking inside a delegate',
    'nullable datetime?',
    'datetime?',
    'datetimeoffset?',
    'timespan?',
    'havekind',
    'haveoffset',
    'guid?',
    'notbeempty',
    'dateonly?',
    'timeonly?',
    'stream checks',
    'stream.should()',
    'bereadable',
    'notbewritable',
    'beseekable',
    'havelength(long)',
    'haveposition(long)',
    'beatbeginning',
    'beatend',
    'never read, seek, change stream state, or dispose the stream',
    'havecontent(byte[])',
    'absence of trailing bytes',
    'non-seekable streams are consumed',
    'fixed 4 kib buffer',
    'haveelementat(index, expected)',
    'zero-based index',
    'default equality comparer for',
    'returns the verified item through',
    'stops after reaching the requested index',
    'negative index throws argumentoutofrangeexception',
    'containinorder',
    'containinconsecutiveorder',
    'notcontaininorder',
    'notcontaininconsecutiveorder',
    'allowing other items between them',
    'requires the expected items to be adjacent',
    'repeated expected values must match distinct subject positions',
    'null items are compared like other values',
    'expected sequences must be finite',
    'negative and consecutive checks read the subject to its end',
    'gap-allowing positive check can stop when it finds the full match',
    'empty expectation succeeds for the positive checks even when the subject is null',
    'a null subject fails because absence cannot be verified',
    'beinascendingorderby',
    'beindescendingorderby',
    'comparer is optional',
    'selector runs once per item',
    'equal adjacent keys are allowed',
    'only the first failing index',
    'exceptions from the selector propagate unchanged',
    'containequivalentof',
    'notcontainequivalentof',
    'allbeequivalentto',
    'returns the matching item through',
    'each call accepts its own equivalency options',
    'nested one-shot sequences are snapshotted at most once',
    'all three checks fail for a null subject',
    'allbeequivalentto and notcontainequivalentof pass for an empty sequence',
    'containequivalentof fails when there is no candidate',
    'mismatch reports the item index and property path',
    'containment miss reports the number of candidates checked',
    'failure messages do not print compared values',
    'equal(expectedentries)',
    'notequal(unexpectedentries)',
    'regardless of entry order',
    'finite sequence of entries with unique, non-null keys',
    'keys and values use their default equality comparers',
    'null expected sequence throws argumentnullexception',
    'duplicate expected keys throw argumentexception',
    'null keys are rejected',
    'entry count, key set, or values differ',
    'failure messages report only the differing category, never keys or values',
    'allbeassignableto',
    'allbeoftype',
    'containitemsassignableto',
    'notcontainitemsassignableto',
    'exact runtime type',
    'typed collection assertion',
    'type selected at runtime',
    'when the sequence contains type values',
    'empty sequence passes only the negative check',
    'at most once',
    'captured exceptions support exact and assignable type checks',
    'withinnerexception',
    'withinnerexceptionexactly',
    'haveinnerexception',
    'nothaveinnerexception',
    'withinnerexceptionmessage',
    'beoftype',
    'beassignableto',
    'where / notwhere predicates that each invoke the supplied predicate exactly once',
    'where predicate',
    'notwhere predicate',
    'invokes the predicate exactly once',
    'argumentnullexception',
    'exceptions thrown by a predicate propagate unchanged',
    'xml assertions use xdocument.should() and xelement.should()',
    'document roots, direct child elements, attribute presence and values',
    'haveroot',
    'nothaveroot',
    'haveelement',
    'nothaveelement',
    'haveattribute',
    'nothaveattribute',
    'haveattributewithvalue',
    'havevalue',
    'namespace-aware overloads accept xname',
    'xml tree equivalence',
    'beequivalentto',
    'notbeequivalentto',
    'compares expanded names and attribute sets',
    'namespace prefixes and unused namespace declarations do not affect the result',
    'ignores an xdocument xml declaration',
    'preserves child-node order',
    'treats cdata and text as the same character data',
    'compares comments, processing instructions, and document types',
    'raw serialized xml strings',
    'httpresponsemessage.should()',
    'havestatuscode',
    'besuccessful',
    'haveresponseheadervalue',
    'havecontentheadervalue',
    'case-insensitive rules',
    'header values use ordinal, case-sensitive comparison',
    'do not read or serialize response content',
    'do not mutate or dispose the response or content',
    'request uris',
    'havecontentasync',
    'containcontentasync',
    'read and buffer the body as text with ordinal comparison',
    'omit expected and actual body text',
  ]) {
    expect(searchableGuide).toContain(term);
  }

  const fullGuide = (assertions?.html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  for (const term of [
    'nullable value checks',
    'nullablevalueassertions',
    'date-only precision is an integer number of days',
    'time-only comparisons are linear and do not wrap across midnight',
    'unavailable on netstandard2.0',
    'guid? supports',
    'dateonly?',
    'timeonly?',
    'havekind',
    'haveoffset',
    'notbeempty',
    'notcompletewithinasync',
    'stream.should()',
    'never read, seek, change stream state, or dispose the stream',
    'exceptionassertions',
    'withinnerexceptionmessage',
    'immediate inner exception',
    'assignable to the requested type',
    'exact runtime type',
    'case-sensitive wildcard rules',
    'without printing exception messages',
    'where predicate',
    'notwhere predicate',
    'invokes the predicate exactly once',
    'exceptions thrown by a predicate propagate unchanged',
    'xdocumentassertions',
    'xelementassertions',
    'all four package targets',
    'direct child of the document root',
    'xname',
    'ordinal comparison',
    'xml text or attribute values',
    'beequivalentto',
    'notbeequivalentto',
    'expanded names and attribute sets',
    'namespace prefixes and unused namespace declarations',
    'xml declaration',
    'child-node order',
    'cdata and text as the same character data',
    'comments, processing instructions, and document types',
    'reader-based helpers remain a separate api concern',
    'containequivalentof',
    'notcontainequivalentof',
    'allbeequivalentto',
    'nested one-shot sequences are snapshotted at most once',
    'mismatch reports the item index and property path',
    'failure messages do not print compared values',
    'equal(expectedentries)',
    'notequal(unexpectedentries)',
    'default equality comparers',
    'duplicate expected keys throw argumentexception',
    'never keys or values',
    'httpresponsemessageassertions',
    'http response assertions',
    'haveresponseheader',
    'nothaveresponseheader',
    'haveresponseheadervalue',
    'nothaveresponseheadervalue',
    'havecontentheader',
    'nothavecontentheader',
    'havecontentheadervalue',
    'nothavecontentheadervalue',
    '2xx range',
    'case-insensitive rules',
    'ordinal comparison',
    'do not read or serialize response content',
    'do not mutate or dispose the response or content',
    'header failures omit values and request uris',
    'body failures omit expected and actual text',
  ]) {
    expect(fullGuide).toContain(term);
  }

  expect(searchDocs('xdocument haveroot').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('xelement beequivalentto').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('httpresponsemessage havecontentheader').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('allbeassignableto containitemsassignableto').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('haveelementat').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('containinorder containinconsecutiveorder').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('beinascendingorderby beindescendingorderby').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('containequivalentof allbeequivalentto').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
  expect(searchDocs('dictionary equal notequal entry order').map((doc) => doc.slugPath)).toContain(
    'assertions',
  );
});

test('CLI guide indexes the read-only assertion migration command and its limits', () => {
  const cliGuide = getDocBySlug('cli');
  expect(cliGuide).not.toBeNull();

  const searchableGuide = cliGuide?.searchText ?? '';
  for (const term of [
    'astraflow assertions analyze',
    'syntax-only',
    'same-name review candidates',
    'relative locations',
    'do not claim semantic equivalence',
    'does not resolve symbols',
    'omits source expressions and literal values',
    'exit code',
    'dependency is confined to astraflow.cli',
  ]) {
    expect(searchableGuide).toContain(term);
  }

  expect(searchDocs('assertions analyze').map((doc) => doc.slugPath)).toContain(
    'cli',
  );
  expect(searchDocs('same-name review candidates').map((doc) => doc.slugPath)).toContain(
    'cli',
  );
});
