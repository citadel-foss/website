import { marked } from 'marked'
import { createHeadingIds, headingText } from './docHeadings.js'

// Full-text search over the markdown docs. A doc is split into sections (one
// per heading). A query matches a section when every word in it matches the
// start of some word in that section.

const WORD = /[\p{L}\p{N}]+(?:[-_.'’][\p{L}\p{N}]+)*/gu
const SEPARATOR = /[-_.'’]/
const MIN_QUERY_LENGTH = 2
const MAX_UNITS = 8
const SNIPPET_LENGTH = 160
// One doc can match on every section; keep room for the other docs.
const MAX_PER_DOC = 6
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'with', 'is', 'are', 'it',
  'i', 'my', 'me', 'do', 'does', 'how', 'what', 'can', 'should',
])

// Score per matching word, by where it was found.
const FIELD_WEIGHTS = { heading: 10, title: 4, trail: 2, text: 2, code: 1.5 }
const PREFIX_FACTOR = 0.6

// ── Reading markdown ──────────────────────────────────────────────

function plainText(tokens) {
  return tokens.map(token => {
    if (token.type === 'html') return ''
    if (token.type === 'br') return ' '
    return token.tokens ? plainText(token.tokens) : token.text || ''
  }).join('')
}

// Splits a markdown doc into one section per heading. `id` is the same id the
// docs page gives the heading, so it can be used as the link's #fragment.
export function buildSections(markdown, doc) {
  const nextHeadingId = createHeadingIds()
  const trailStack = []
  const sections = []
  let current

  function start(heading, id, level, trail) {
    current = {
      docId: doc.docId,
      docLabel: doc.label,
      group: doc.group,
      order: doc.order,
      heading,
      id,
      level,
      trail,
      text: '',
      code: '',
    }
    sections.push(current)
  }

  function visit(tokens) {
    for (const token of tokens) {
      switch (token.type) {
        case 'heading': {
          const id = nextHeadingId(headingText(token.tokens))
          while (trailStack.length && trailStack.at(-1).level >= token.depth) trailStack.pop()
          // The page title (h1) is already shown as the doc name, so it is not part of the trail.
          start(plainText(token.tokens).trim(), id, token.depth,
            trailStack.filter(entry => entry.level > 1).map(entry => entry.heading))
          trailStack.push({ level: token.depth, heading: current.heading })
          break
        }
        case 'paragraph':
        case 'text':
          current.text += `${token.tokens ? plainText(token.tokens) : token.text}\n`
          break
        case 'code':
          current.code += `${token.text}\n`
          break
        case 'blockquote':
          visit(token.tokens)
          break
        case 'list':
          token.items.forEach(item => visit(item.tokens))
          break
        case 'table':
          current.text += `${token.header.map(cell => plainText(cell.tokens)).join(' ')}\n`
          token.rows.forEach(row => {
            current.text += `${row.map(cell => plainText(cell.tokens)).join(' ')}\n`
          })
          break
      }
    }
  }

  // Text before the first heading belongs to a section without an anchor.
  start('', '', 0, [])
  visit(marked.lexer(markdown, { gfm: true }))

  return sections.filter(section => section.heading || section.text || section.code)
}

// ── Matching ──────────────────────────────────────────────────────

export function tokenize(value) {
  return (value.toLowerCase().match(WORD) || [])
}

// "tx_count" is kept whole and also split into "tx" and "count", so a search
// for either one finds it. Maps each word to how many times it appears.
function wordCounts(value) {
  const counts = new Map()
  const add = word => counts.set(word, (counts.get(word) || 0) + 1)

  for (const token of tokenize(value)) {
    add(token)
    if (SEPARATOR.test(token)) token.split(SEPARATOR).filter(Boolean).forEach(add)
  }
  return counts
}

// The word as typed, plus its singular ("offers" also finds "offer").
function formsOf(unit) {
  return unit.length > 3 && unit.endsWith('s') ? [unit, unit.slice(0, -1)] : [unit]
}

// How well a word list matches one query word: 0 for no match.
function fieldScore(counts, forms, weight) {
  let best = 0
  let uses = 0

  for (const [word, count] of counts) {
    if (word === forms[0]) {
      best = 1
      uses += count
    } else if (forms.some(form => form.length >= MIN_QUERY_LENGTH && word.startsWith(form))) {
      best = Math.max(best, PREFIX_FACTOR)
      uses += count
    }
  }
  return best ? weight * best * (1 + Math.log(uses)) : 0
}

export function createSearchIndex() {
  const entries = []

  return {
    get size() {
      return entries.length
    },

    add(sections) {
      for (const section of sections) {
        entries.push({
          section,
          heading: wordCounts(section.heading),
          title: wordCounts(section.docLabel),
          trail: wordCounts([section.group, ...section.trail].join(' ')),
          text: wordCounts(section.text),
          code: wordCounts(section.code),
          headingLower: section.heading.toLowerCase(),
          textLower: section.text.toLowerCase(),
        })
      }
    },

    search(query, limit = 30) {
      // Filler words ("how to run a maker") must not be required to match.
      const words = tokenize(query)
      const meaningful = words.filter(word => !STOP_WORDS.has(word))
      const units = [...new Set(meaningful.length > 0 ? meaningful : words)].slice(0, MAX_UNITS)
      if (query.trim().length < MIN_QUERY_LENGTH || units.length === 0) return { units, results: [] }

      const unitForms = units.map(formsOf)
      const phrase = units.join(' ')
      const results = []

      for (const entry of entries) {
        let score = 0

        for (const forms of unitForms) {
          let unitScore = 0
          for (const field of Object.keys(FIELD_WEIGHTS)) {
            unitScore += fieldScore(entry[field], forms, FIELD_WEIGHTS[field])
          }
          if (unitScore === 0) {
            score = 0
            break
          }
          score += unitScore
        }
        if (score === 0) continue

        if (units.length > 1) {
          if (entry.headingLower.includes(phrase)) score += 10
          else if (entry.textLower.includes(phrase)) score += 4
        }
        results.push({ section: entry.section, score })
      }

      results.sort((a, b) => b.score - a.score || compareOrder(a.section, b.section))

      const perDoc = new Map()
      const picked = []
      for (const result of results) {
        const count = perDoc.get(result.section.docId) || 0
        if (count >= MAX_PER_DOC) continue
        perDoc.set(result.section.docId, count + 1)
        picked.push(result)
        if (picked.length === limit) break
      }
      return { units, results: picked }
    },
  }
}

// Docs load in any order, so ties are broken by the order of the sidebar.
function compareOrder(a, b) {
  return a.order - b.order || a.id.localeCompare(b.id)
}

// ── Snippets ──────────────────────────────────────────────────────

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matcherFor(units) {
  const words = [...new Set(units.flatMap(formsOf))].sort((a, b) => b.length - a.length).map(escapeRegExp)
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${words.join('|')})`, 'giu')
}

function splitMatches(text, matcher) {
  const segments = []
  let last = 0

  for (const match of text.matchAll(matcher)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), match: false })
    segments.push({ text: match[0], match: true })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), match: false })
  return segments
}

// A short piece of the section around the first match, as a list of
// { text, match } pieces so the caller can highlight without raw HTML.
export function snippetFor(section, units) {
  const flatten = value => value.replace(/\s+/g, ' ').trim()
  const text = flatten(section.text)
  const code = flatten(section.code)
  const matcher = matcherFor(units.length ? units : ['\u0000'])

  const textHit = text.search(matcher)
  const codeHit = textHit === -1 ? code.search(matcher) : -1
  const isCode = textHit === -1 && codeHit !== -1
  const source = isCode ? code : text || code
  const hit = isCode ? codeHit : Math.max(textHit, 0)

  if (!source) return { segments: [], isCode: false }

  let from = Math.max(0, hit - 50)
  if (from > 0) {
    const space = source.indexOf(' ', from)
    from = space === -1 || space > hit ? from : space + 1
  }
  const to = Math.min(source.length, from + SNIPPET_LENGTH)

  const excerpt = `${from > 0 ? '…' : ''}${source.slice(from, to)}${to < source.length ? '…' : ''}`
  return { segments: splitMatches(excerpt, matcher), isCode }
}

// Splits plain text (e.g. a heading) into highlighted pieces.
export function highlight(text, units) {
  if (!units.length) return [{ text, match: false }]
  return splitMatches(text, matcherFor(units))
}
