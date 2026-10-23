import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDocSearch } from '../../hooks/useDocSearch.js'
import { highlight, snippetFor } from '../../lib/docSearch.js'

const EXAMPLES = ['fee rate', 'tx_count', 'blocklist', 'fidelity bond']
const LISTBOX_ID = 'docs-search-results'

function Marked({ pieces }) {
  return pieces.map((piece, index) => (
    piece.match ? <mark key={index}>{piece.text}</mark> : piece.text
  ))
}

function Result({ section, units, id, active, onSelect, onHover }) {
  const { segments, isCode } = snippetFor(section, units)
  const crumb = [section.group, section.docLabel, ...section.trail].join(' › ')

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      className="docs-search__option"
      onClick={onSelect}
      onMouseMove={onHover}
    >
      <span className="docs-search__crumb">{crumb}</span>
      <span className="docs-search__title">
        <Marked pieces={highlight(section.heading || section.docLabel, units)} />
      </span>
      {segments.length > 0 && (
        <span className={`docs-search__snippet ${isCode ? 'docs-search__snippet--code' : ''}`}>
          <Marked pieces={segments} />
        </span>
      )}
    </li>
  )
}

export default function DocsSearchDialog({ onClose, onSelect }) {
  const dialogRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const docSearch = useDocSearch()

  // `search` is replaced whenever another doc finishes loading, so results grow as docs arrive.
  const { search } = docSearch
  const { units, results } = useMemo(() => search(query), [search, query])
  const active = Math.min(activeIndex, results.length - 1)
  const hasQuery = query.trim().length >= 2

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  function handleChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
  }

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((active + step + results.length) % results.length)
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault()
      onSelect(results[active].section)
    }
  }

  function handleDialogClick(event) {
    // A click on the dimmed area around the panel lands on the dialog itself.
    if (event.target === event.currentTarget) dialogRef.current?.close()
  }

  let status
  if (hasQuery && results.length > 0) {
    status = `${results.length} ${results.length === 1 ? 'result' : 'results'}`
  } else if (docSearch.indexing) {
    status = `Reading docs… ${docSearch.loaded} of ${docSearch.total}`
  } else if (hasQuery) {
    status = 'No results'
  } else {
    status = `${docSearch.loaded} docs ready to search`
  }

  return (
    <dialog
      ref={dialogRef}
      className="docs-search"
      aria-label="Search the docs"
      onClose={onClose}
      onClick={handleDialogClick}
    >
      <div className="docs-search__bar">
        <Search size={18} aria-hidden="true" />
        <input
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint="go"
          placeholder="Search the docs"
          aria-label="Search the docs"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={results.length > 0 ? `docs-search-option-${active}` : undefined}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="docs-search__close" aria-label="Close search" onClick={() => dialogRef.current?.close()}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="docs-search__body">
        <ul id={LISTBOX_ID} ref={listRef} role="listbox" aria-label="Search results" className="docs-search__list" hidden={results.length === 0}>
          {results.map(({ section }, index) => (
            <Result
              key={`${section.docId}#${section.id}-${index}`}
              id={`docs-search-option-${index}`}
              section={section}
              units={units}
              active={index === active}
              onSelect={() => onSelect(section)}
              onHover={() => index !== active && setActiveIndex(index)}
            />
          ))}
        </ul>

        {results.length === 0 && (
          <div className="docs-search__empty">
            {hasQuery && !docSearch.indexing ? (
              <>
                <p className="docs-search__empty-title">Nothing found for “{query.trim()}”</p>
                <p>Try fewer or shorter words. Search matches the start of words, so “fund” finds “funding”.</p>
              </>
            ) : (
              <>
                <p className="docs-search__empty-title">
                  {hasQuery ? 'Still reading the docs…' : 'Search headings, text and commands'}
                </p>
                <p>Try one of these:</p>
                <div className="docs-search__examples">
                  {EXAMPLES.map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuery(example)
                        setActiveIndex(0)
                      }}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="docs-search__footer">
        <span role="status" aria-live="polite">
          {status}
          {docSearch.failed > 0 && !docSearch.indexing && (
            <>
              {' · '}
              {docSearch.failed} {docSearch.failed === 1 ? 'doc' : 'docs'} could not load{' '}
              <button type="button" className="docs-search__retry" onClick={docSearch.retry}>Retry</button>
            </>
          )}
        </span>
        <span className="docs-search__hints" aria-hidden="true">↑↓ move · Enter open · Esc close</span>
      </div>
    </dialog>
  )
}
