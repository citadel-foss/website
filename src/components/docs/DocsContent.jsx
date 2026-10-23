import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { marked } from 'marked'
import CodeBlock from '../ui/CodeBlock.jsx'
import { useDocContent } from '../../hooks/useDocContent.js'
import { createHeadingIds, headingText } from '../../lib/docHeadings.js'
import { DEVELOPER_DOCS_NAV, getNavWithDocIds } from '../../constants/docsNav.js'

let mermaidRenderId = 0
const docsByUrl = new Map(
  getNavWithDocIds(DEVELOPER_DOCS_NAV)
    .flatMap(section => section.items || [])
    .map(doc => [new URL(doc.url).href, doc.docId])
)
const legacySpecDocs = new Map([
  ['1_architecture.md', 'protocol-specs/architecture'],
  ['2_messages.md', 'v1-protocol/messages'],
  ['3_protocol-flow.md', 'v1-protocol/protocol-flow'],
  ['4_fidelity.md', 'protocol-specs/fidelity'],
  ['5_fees.md', 'protocol-specs/fees'],
  ['6_security.md', 'protocol-specs/security'],
])

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function resolveDocUrl(baseUrl, target) {
  if (!target) return target

  try {
    return new URL(target, baseUrl).toString()
  } catch {
    return target
  }
}

function resolveMarkdownLink(baseUrl, target) {
  if (!target || target.startsWith('#') || target.startsWith('/developers?')) return target

  let resolved
  try {
    resolved = new URL(target, baseUrl)
  } catch {
    return target
  }

  if (!['http:', 'https:'].includes(resolved.protocol)) return target

  const sourceUrl = new URL(baseUrl)
  if (sourceUrl.pathname.startsWith('/citadel-foss/OpenSwap-Protocol-Specification/main/general%20specs/') &&
      (target.startsWith('./') || target.startsWith('/v1/'))) {
    const legacyId = legacySpecDocs.get(resolved.pathname.split('/').at(-1))
    if (legacyId) return `/developers?doc=${encodeURIComponent(legacyId)}${resolved.hash}`
  }

  let rawUrl = resolved
  if (resolved.hostname === 'github.com') {
    const [owner, repo, kind, branch, ...path] = resolved.pathname.split('/').filter(Boolean)
    if (kind === 'blob' && path.length) {
      rawUrl = new URL(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.join('/')}`)
    }
  }

  const docId = docsByUrl.get(`${rawUrl.origin}${rawUrl.pathname}`)
  if (docId) return `/developers?doc=${encodeURIComponent(docId)}${resolved.hash}`

  if (resolved.hostname === 'raw.githubusercontent.com') {
    const [owner, repo, branch, ...path] = resolved.pathname.split('/').filter(Boolean)
    if (path.length) {
      const name = path.at(-1)
      const isDirectory = !/\.[^/]+$/.test(name) && !/^(LICENSE|README|Makefile|Dockerfile)$/i.test(name)
      const kind = isDirectory ? 'tree' : 'blob'
      return `https://github.com/${owner}/${repo}/${kind}/${branch}/${path.join('/')}${resolved.hash}`
    }
  }

  return resolved.href
}

function shouldResolveUrl(target) {
  if (!target) return false

  return !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)
}

function resolveHtmlUrls(html, baseUrl) {
  return html.replace(
    /\b(src|href)=("([^"]*)"|'([^']*)')/gi,
    (match, attr, quotedValue, doubleQuoted, singleQuoted) => {
      const value = doubleQuoted ?? singleQuoted ?? ''
      if (attr.toLowerCase() === 'src' && !shouldResolveUrl(value)) return match

      const resolved = attr.toLowerCase() === 'src'
        ? resolveDocUrl(baseUrl, value)
        : resolveMarkdownLink(baseUrl, value)
      const quote = quotedValue[0]
      return `${attr}=${quote}${resolved}${quote}`
    }
  )
}

function fragmentId(hash) {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return null
  }
}

function renderMarkdown(content, baseUrl) {
  const renderer = new marked.Renderer()
  const renderCode = renderer.code.bind(renderer)
  const nextHeadingId = createHeadingIds()

  renderer.heading = function ({ depth, tokens }) {
    const id = nextHeadingId(headingText(tokens))
    return `<h${depth} id="${escapeHtml(id)}">${this.parser.parseInline(tokens)}</h${depth}>`
  }

  renderer.image = ({ href, title, text }) => {
    const src = resolveDocUrl(baseUrl, href)
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    const alt = text ?? ''
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} />`
  }

  renderer.link = function ({ href, title, tokens }) {
    const resolvedHref = resolveMarkdownLink(baseUrl, href)
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    const text = this.parser.parseInline(tokens)
    return `<a href="${escapeHtml(resolvedHref)}"${titleAttr}>${text}</a>`
  }

  renderer.code = token => {
    if (token.lang?.trim().toLowerCase() === 'mermaid') {
      return `<div class="mermaid-diagram" role="img" aria-label="Diagram">${escapeHtml(token.text)}</div>`
    }

    return renderCode(token)
  }

  const html = marked(content, { gfm: true, breaks: false, renderer })
  return resolveHtmlUrls(html, baseUrl)
}

function GitHubLink({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-sm text-black/65 underline decoration-black/20 underline-offset-[0.18em] transition-colors hover:text-black hover:decoration-black/50"
    >
      View on GitHub
      <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
    </a>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 py-16 text-black/65">
      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="font-mono text-sm uppercase tracking-wider">Loading...</span>
    </div>
  )
}

function ErrorMessage({ message }) {
  return (
    <div className="border border-dotted border-red-400/40 bg-red-50/50 px-5 py-4">
      <p className="font-mono text-sm text-red-700">
        Failed to load document: {message}
      </p>
    </div>
  )
}

function GetStartedPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="type-page-title font-display font-semibold text-black">
          OpenSwap Documentation
        </h1>
        <p className="type-body mt-4 max-w-2xl text-black/65">
          Everything you need to understand, deploy, and build on the OpenSwap protocol —
          a non-custodial, atomic, multi-hop Bitcoin swap system built on Taproot and MuSig2.
        </p>
      </div>

      <div className="border-t border-dotted border-black/15 pt-6">
        <h2 className="type-section-title font-display font-semibold text-black">
          Core Concepts
        </h2>
        <dl className="mt-4 space-y-4 type-body text-black/70">
          <div>
            <dt className="font-mono text-sm font-semibold uppercase tracking-wider text-black/65">Takers</dt>
            <dd className="mt-1">
              Users who initiate swaps. The <code className="inline-code">taker</code> binary connects
              to makers over Tor, negotiates fees, and executes atomic multi-hop swaps.{' '}
              <Link to="/takers" className="simple-link">Learn more</Link>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-sm font-semibold uppercase tracking-wider text-black/65">Makers</dt>
            <dd className="mt-1">
              Liquidity providers that run <code className="inline-code">makerd</code> as a Tor hidden service.
              Makers post fidelity bonds and earn fees for providing swap liquidity.{' '}
              <Link to="/makers" className="simple-link">Learn more</Link>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-sm font-semibold uppercase tracking-wider text-black/65">Nostr Relays</dt>
            <dd className="mt-1">
              Makers announce their fidelity bonds as events on public nostr relays.
              Takers discover makers by reading these announcements and verifying each
              bond on-chain — no central directory server required.
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-dotted border-black/15 pt-6">
        <h2 className="type-section-title font-display font-semibold text-black">
          Getting Started
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Run a Taker', desc: 'Start swapping with the CLI', section: 'manuals', item: 'Taker' },
            { label: 'Deploy a Maker', desc: 'Provide liquidity and earn fees', section: 'manuals', item: 'Makerd' },
            { label: 'Protocol Specs', desc: 'Understand the cryptographic protocol', section: 'protocol-specs' },
            { label: 'FFI Bindings', desc: 'Build apps in JS, React Native, Python, Kotlin, Swift, or Ruby', section: 'ffis' },
          ].map(card => (
            <div
              key={card.label}
              className="border border-dotted border-black/12 bg-white/30 px-5 py-4 transition-colors hover:border-black/25"
            >
              <p className="font-mono text-sm font-semibold text-black">{card.label}</p>
              <p className="mt-1 text-sm text-black/55">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-dotted border-black/15 pt-6">
        <p className="type-small text-black/65">
          Use the sidebar to navigate through manuals, protocol specifications, code examples,
          FFI bindings, and GUI documentation.
        </p>
      </div>
    </div>
  )
}

function MarkdownContent({ url, repoUrl }) {
  const { content, loading, error } = useDocContent(url)
  const contentRef = useRef(null)
  const { hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!content || !hash || !contentRef.current) return undefined

    const id = fragmentId(hash)
    if (id === null) return undefined

    const frame = requestAnimationFrame(() => {
      if (!id) {
        window.scrollTo(0, 0)
        return
      }
      const heading = Array.from(contentRef.current?.querySelectorAll('[id]') || [])
        .find(element => element.id === id)
      heading?.scrollIntoView()
    })

    return () => cancelAnimationFrame(frame)
  }, [content, hash, url])

  function handleLinkClick(event) {
    const link = event.target.closest('a[href]')
    if (!link || !contentRef.current?.contains(link) || event.defaultPrevented ||
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const destination = new URL(link.href)
    if (destination.origin !== window.location.origin || destination.pathname !== '/developers') return

    if (destination.href === window.location.href) {
      const id = fragmentId(destination.hash)
      if (id) document.getElementById(id)?.scrollIntoView()
      else if (id === '') window.scrollTo(0, 0)
      event.preventDefault()
      return
    }

    event.preventDefault()
    navigate(`${destination.pathname}${destination.search}${destination.hash}`)
  }

  useEffect(() => {
    if (!content || !contentRef.current) return undefined

    const diagrams = Array.from(contentRef.current.querySelectorAll('.mermaid-diagram'))
      .map(node => ({ node, source: node.textContent }))

    if (diagrams.length === 0) return undefined

    let cancelled = false

    async function drawDiagrams() {
      const { default: mermaid } = await import('mermaid')
      const isDark = document.documentElement.dataset.theme === 'dark'

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark ? 'dark' : 'neutral',
        fontFamily: 'IBM Plex Sans, sans-serif',
      })

      for (const { node, source } of diagrams) {
        if (cancelled) return

        try {
          const id = `openswap-mermaid-${mermaidRenderId += 1}`
          const { svg, bindFunctions } = await mermaid.render(id, source)
          if (cancelled) return
          node.innerHTML = svg
          node.classList.remove('mermaid-diagram--error')
          bindFunctions?.(node)
        } catch {
          node.textContent = source
          node.classList.add('mermaid-diagram--error')
        }
      }
    }

    drawDiagrams()

    const themeObserver = new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.attributeName === 'data-theme')) {
        drawDiagrams()
      }
    })

    themeObserver.observe(document.documentElement, { attributes: true })

    return () => {
      cancelled = true
      themeObserver.disconnect()
    }
  }, [content, url])

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorMessage message={error} />
  if (!content) return null

  const html = renderMarkdown(content, url)

  return (
    <div>
      {repoUrl && (
        <div className="mb-6">
          <GitHubLink url={repoUrl} />
        </div>
      )}
      <div
        ref={contentRef}
        className="prose-content"
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function CodeContent({ url, lang, repoUrl, label }) {
  const { content, loading, error } = useDocContent(url)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorMessage message={error} />
  if (!content) return null

  return (
    <div>
      {repoUrl && (
        <div className="mb-6">
          <GitHubLink url={repoUrl} />
        </div>
      )}
      {label && (
        <h2 className="type-card-title mb-4 font-display font-semibold text-black">{label}</h2>
      )}
      <CodeBlock code={content} language={lang} />
    </div>
  )
}

export default function DocsContent({ activeDoc }) {
  if (!activeDoc) return <GetStartedPanel />

  if (activeDoc.lang) {
    return (
      <CodeContent
        url={activeDoc.url}
        lang={activeDoc.lang}
        repoUrl={activeDoc.repoUrl}
        label={activeDoc.label}
      />
    )
  }

  return <MarkdownContent url={activeDoc.url} repoUrl={activeDoc.repoUrl} />
}
