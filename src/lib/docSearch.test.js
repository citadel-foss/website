import test from 'node:test'
import assert from 'node:assert/strict'
import { marked } from 'marked'
import { createHeadingIds, headingText } from './docHeadings.js'
import { buildSections, createSearchIndex, highlight, snippetFor, tokenize } from './docSearch.js'

const FEES = `# Fee policy

Intro text before any section.

## Who pays what

The taker pays the service fee, the funding fee and the sweep fee.

## Funding splits

Set \`tx_count\` or pass \`--tx-counts 1,3,1\` to cap the splits.

\`\`\`bash
taker fetch-offers --tx-counts 2
\`\`\`

## Setup

First setup.

## Setup

Second setup.
`

const TOR = `# Tor

Run a Tor daemon so makers can be reached.

> ## Quoted heading
> Text inside a quote.

- item one
- ## Heading in a list
`

function indexOf(...docs) {
  const index = createSearchIndex()
  docs.forEach(([markdown, doc]) => index.add(buildSections(markdown, doc)))
  return index
}

const feesDoc = { docId: 'manuals/fee-policy', label: 'Fee Policy', group: 'Manuals', order: 0 }
const torDoc = { docId: 'manuals/tor', label: 'Tor', group: 'Manuals', order: 1 }

test('buildSections gives each heading its own section, and keeps the intro', () => {
  const sections = buildSections(FEES, feesDoc)
  assert.deepEqual(
    sections.map(section => section.heading),
    ['Fee policy', 'Who pays what', 'Funding splits', 'Setup', 'Setup'],
  )
  assert.match(sections[0].text, /Intro text/)
  assert.match(sections[2].code, /fetch-offers/)
  assert.deepEqual(sections[1].trail, [])
})

test('the trail lists the headings a section sits under', () => {
  const sections = buildSections('# Doc\n\n## One\n\n### Two\n\n#### Three\n\n## Four', feesDoc)
  assert.deepEqual(sections.map(section => section.trail), [[], [], ['One'], ['One', 'Two'], []])
})

test('section ids match the ids the docs page gives to headings', () => {
  const sections = buildSections(FEES, feesDoc)
  assert.deepEqual(
    sections.map(section => section.id),
    ['fee-policy', 'who-pays-what', 'funding-splits', 'setup', 'setup-1'],
  )

  // Same heading rules as the renderer in DocsContent.
  const renderer = new marked.Renderer()
  const nextId = createHeadingIds()
  const rendered = []
  renderer.heading = function ({ tokens }) {
    rendered.push(nextId(headingText(tokens)))
    return ''
  }
  marked(FEES, { gfm: true, renderer })
  assert.deepEqual(sections.map(section => section.id), rendered)
})

test('headings inside quotes and lists are indexed in document order', () => {
  const sections = buildSections(TOR, torDoc)
  assert.deepEqual(
    sections.map(section => section.heading),
    ['Tor', 'Quoted heading', 'Heading in a list'],
  )
})

test('tokenize keeps compound words whole', () => {
  assert.deepEqual(tokenize('Run `--tx-counts` and tx_count, fetch-offers.'), [
    'run', 'tx-counts', 'and', 'tx_count', 'fetch-offers',
  ])
})

test('a query needs every word, and matches the start of words', () => {
  const index = indexOf([FEES, feesDoc])
  const ids = query => index.search(query).results.map(result => result.section.id)

  // The doc title ("Fee Policy") counts too, so the section with both words comes first.
  assert.equal(ids('funding fee')[0], 'who-pays-what')
  // A heading match comes before a match in the body.
  assert.deepEqual(ids('fund'), ['funding-splits', 'who-pays-what'])
  assert.deepEqual(ids('zebra'), [])
  assert.deepEqual(ids('funding zebra'), [])
})

test('tx_count, --tx-counts and fetch-offers can be found', () => {
  const index = indexOf([FEES, feesDoc])
  const top = query => index.search(query).results[0]?.section.id

  assert.equal(top('tx_count'), 'funding-splits')
  assert.equal(top('--tx-counts'), 'funding-splits')
  assert.equal(top('fetch-offers'), 'funding-splits')
  assert.equal(top('counts'), 'funding-splits')
})

test('headings rank above body text', () => {
  const index = indexOf(
    ['# A\n\n## Other\n\nThe blocklist is described here, blocklist blocklist.\n\n## Blocklist\n\nShort.', feesDoc],
  )
  assert.equal(index.search('blocklist').results[0].section.heading, 'Blocklist')
})

test('an exact heading phrase beats scattered words', () => {
  const index = indexOf(
    ['# A\n\n## Fee rate\n\nx\n\n## Rate of the fee\n\ny', feesDoc],
  )
  assert.equal(index.search('fee rate').results[0].section.heading, 'Fee rate')
})

test('plural words find the singular', () => {
  const index = indexOf([FEES, feesDoc])
  assert.equal(index.search('splits').results.length > 0, true)
  assert.equal(index.search('contracts').results.length, 0)
  const single = indexOf(['# A\n\n## Contract\n\nOne contract.', feesDoc])
  assert.equal(single.search('contracts').results.length, 1)
})

test('filler words do not have to match', () => {
  const index = indexOf([FEES, feesDoc])
  assert.equal(index.search('how do I set the tx_count').results[0].section.id, 'funding-splits')
  // A query made only of filler words still searches for them.
  assert.deepEqual(index.search('the').units, ['the'])
})

test('one doc cannot fill the whole result list', () => {
  const many = Array.from({ length: 10 }, (_, i) => `## Swap part ${i}\n\nswap`).join('\n\n')
  const index = indexOf([`# Big\n\n${many}`, feesDoc], ['# Small\n\n## Swap\n\nswap', torDoc])
  const docs = index.search('swap').results.map(result => result.section.docId)
  assert.equal(docs.filter(id => id === 'manuals/fee-policy').length, 6)
  assert.ok(docs.includes('manuals/tor'))
})

test('queries that are too short or empty return nothing', () => {
  const index = indexOf([FEES, feesDoc])
  assert.deepEqual(index.search('').results, [])
  assert.deepEqual(index.search('   ').results, [])
  assert.deepEqual(index.search('t').results, [])
  assert.deepEqual(index.search('!!!').results, [])
})

test('equal scores follow sidebar order, whatever order docs were added in', () => {
  const body = '# Doc\n\n## Swap\n\nswap'
  const index = indexOf([body, torDoc], [body, feesDoc])
  assert.deepEqual(
    index.search('swap').results.map(result => result.section.docId),
    ['manuals/fee-policy', 'manuals/tor'],
  )
})

test('docs can be added while searching (results appear as docs load)', () => {
  const index = createSearchIndex()
  index.add(buildSections(FEES, feesDoc))
  assert.equal(index.search('daemon').results.length, 0)
  index.add(buildSections(TOR, torDoc))
  assert.equal(index.search('daemon').results.length, 1)
})

test('snippets are centred on the match and marked', () => {
  const index = indexOf([`# A\n\n## Long\n\n${'word '.repeat(60)}needle ${'more '.repeat(60)}`, feesDoc])
  const { units, results } = index.search('needle')
  const { segments, isCode } = snippetFor(results[0].section, units)
  const joined = segments.map(segment => segment.text).join('')

  assert.equal(isCode, false)
  assert.ok(joined.startsWith('…') && joined.endsWith('…'))
  assert.ok(joined.length <= 164)
  assert.deepEqual(segments.filter(segment => segment.match).map(segment => segment.text), ['needle'])
})

test('snippets come from code when only the code matches', () => {
  const index = indexOf([FEES, feesDoc])
  const { units, results } = index.search('fetch-offers')
  const { segments, isCode } = snippetFor(results[0].section, units)

  assert.equal(isCode, true)
  assert.deepEqual(segments.filter(segment => segment.match).map(segment => segment.text), ['fetch-offers'])
})

test('highlight never injects markup and keeps the original text', () => {
  const pieces = highlight('Use <b>Fee</b> & fee', ['fee'])
  assert.equal(pieces.map(piece => piece.text).join(''), 'Use <b>Fee</b> & fee')
  assert.deepEqual(pieces.filter(piece => piece.match).map(piece => piece.text), ['Fee', 'fee'])
})
