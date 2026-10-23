import { useState, useEffect } from 'react'

const cache = new Map()
const inflight = new Map()

export function clearCache() {
  cache.clear()
}

// Fetches a doc once. Shared by the doc page and the docs search, so a doc
// that was already read is never downloaded again.
export function loadDoc(url) {
  if (cache.has(url)) return Promise.resolve(cache.get(url))
  if (inflight.has(url)) return inflight.get(url)

  const request = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.text()
    })
    .then(text => {
      cache.set(url, text)
      return text
    })
    .finally(() => inflight.delete(url))

  inflight.set(url, request)
  return request
}

export function useDocContent(url) {
  const [result, setResult] = useState({ url: null, content: null, error: null })

  useEffect(() => {
    if (!url || cache.has(url)) return

    let cancelled = false
    loadDoc(url)
      .then(text => {
        if (cancelled) return
        setResult({ url, content: text, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setResult({ url, content: null, error: err.message })
      })
    return () => { cancelled = true }
  }, [url])

  if (!url) return { content: null, loading: false, error: null }
  if (cache.has(url)) return { content: cache.get(url), loading: false, error: null }
  if (result.url === url) return { content: result.content, loading: false, error: result.error }

  return { content: null, loading: true, error: null }
}
