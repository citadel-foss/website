import { useEffect, useSyncExternalStore } from 'react'
import { DEVELOPER_DOCS_NAV, getNavWithDocIds } from '../constants/docsNav.js'
import { buildSections, createSearchIndex } from '../lib/docSearch.js'
import { loadDoc } from './useDocContent.js'

// Keeps one search index for the whole session. Docs are fetched the first
// time search is opened, a few at a time, and added to the index as they
// arrive, so results show up while the rest is still loading.

const CONCURRENCY = 4

const docs = []
for (const section of getNavWithDocIds(DEVELOPER_DOCS_NAV)) {
  for (const item of section.items || []) {
    // Example source files are not markdown docs.
    if (item.lang) continue
    docs.push({ docId: item.docId, label: item.label, group: section.label, url: item.url, order: docs.length })
  }
}

const store = {
  index: createSearchIndex(),
  queue: [],
  active: 0,
  loaded: 0,
  failed: new Set(),
  started: false,
  search: null,
}
const listeners = new Set()

// A new `search` function is made whenever the index changes, so anything that
// depends on it runs again once more docs have loaded.
function emit() {
  store.search = (query, limit) => store.index.search(query, limit)
  listeners.forEach(listener => listener())
}
emit()

function pump() {
  while (store.active < CONCURRENCY && store.queue.length > 0) {
    const doc = store.queue.shift()
    store.active += 1

    loadDoc(doc.url)
      .then(markdown => {
        store.index.add(buildSections(markdown, doc))
        store.loaded += 1
      })
      .catch(() => store.failed.add(doc.docId))
      .finally(() => {
        store.active -= 1
        emit()
        pump()
      })
  }
}

function startIndexing() {
  if (store.started) return
  store.started = true
  store.queue = [...docs]
  pump()
  emit()
}

function retryFailed() {
  const retry = docs.filter(doc => store.failed.has(doc.docId))
  if (retry.length === 0) return
  store.failed.clear()
  store.queue.push(...retry)
  pump()
  emit()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSearch = () => store.search

export function useDocSearch() {
  const search = useSyncExternalStore(subscribe, getSearch)

  useEffect(() => {
    startIndexing()
  }, [])

  return {
    search,
    total: docs.length,
    loaded: store.loaded,
    failed: store.failed.size,
    indexing: store.active > 0 || store.queue.length > 0,
    retry: retryFailed,
  }
}
