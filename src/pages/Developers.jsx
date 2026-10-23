import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Menu, Search, X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'
import CodeBlock from '../components/ui/CodeBlock'
import DocsContent from '../components/docs/DocsContent'
import DocsSidebar from '../components/docs/DocsSidebar'
import { LINKS } from '../constants/links'
import { DEVELOPER_DOCS_NAV, findDocById } from '../constants/docsNav'

const loadSearchDialog = () => import('../components/docs/DocsSearchDialog')
const DocsSearchDialog = lazy(loadSearchDialog)

const SHORTCUT_LABEL = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
  ? '⌘K'
  : 'Ctrl K'

const BUILD_COMMAND = `git clone https://github.com/citadel-foss/openswap
cd openswap
cargo build --release`

const FFI_LINKS = [
  {
    name: 'JavaScript',
    support: 'Node.js + Electron',
    description: 'NAPI bindings for Node.js and Electron, with pre-built native modules for desktop environments.',
    href: LINKS.ffi_js_repo,
  },
  {
    name: 'Kotlin',
    support: 'Android + JVM',
    description: 'UniFFI bindings for Android and JVM applications.',
    href: LINKS.ffi_kotlin_repo,
  },
  {
    name: 'React Native',
    support: 'Android + iOS',
    description: 'JSI and TurboModule bindings for mobile applications.',
    href: LINKS.ffi_react_native_repo,
  },
  {
    name: 'Swift',
    support: 'iOS + macOS',
    description: 'UniFFI bindings and an xcframework for Apple platforms.',
    href: LINKS.ffi_swift_repo,
  },
  {
    name: 'Python',
    support: 'Python 3.8+',
    description: 'Cross-platform bindings for scripts, services, and desktop tools.',
    href: LINKS.ffi_python_repo,
  },
  {
    name: 'Ruby',
    support: 'Ruby 2.7+',
    description: 'FFI-based bindings for standalone Ruby and Rails applications.',
    href: LINKS.ffi_ruby_repo,
  },
  {
    name: 'C#',
    support: '.NET 8+',
    description: 'UniFFI-generated .NET bindings exposed through a stable managed wrapper.',
    href: LINKS.ffi_csharp_repo,
  },
]

function ExternalTextLink({ href, children, className = '' }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`portal-link ${className}`}>
      {children}
      <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
    </a>
  )
}

export default function Developers() {
  const [docsOpen, setDocsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const requestedDocId = searchParams.get('doc')
  const activeDoc = findDocById(requestedDocId, DEVELOPER_DOCS_NAV)

  // Ctrl/Cmd+K opens the docs search anywhere on this page, and "/" does too
  // unless the person is typing in a field.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.defaultPrevented || event.isComposing) return

      const target = event.target
      const isTyping = target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      const isShortcut = event.key.toLowerCase() === 'k' &&
        (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey
      const isSlash = event.key === '/' && !isTyping &&
        !event.metaKey && !event.ctrlKey && !event.altKey

      if (!isShortcut && !isSlash) return
      event.preventDefault()
      setSearchOpen(open => (isShortcut ? !open : true))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleDocSelect(doc) {
    if (!doc?.docId) return

    setDocsOpen(false)
    // Already on this doc: don't add a duplicate history entry.
    if (doc.docId === requestedDocId && !hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('doc', doc.docId)
    setSearchParams(nextSearchParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSearchSelect(section) {
    const nextHash = section.id ? `#${encodeURIComponent(section.id)}` : ''
    setSearchOpen(false)
    setDocsOpen(false)

    // Already on that exact link: the router would do nothing, so scroll here.
    if (requestedDocId === section.docId && hash === nextHash) {
      if (section.id) document.getElementById(section.id)?.scrollIntoView()
      else window.scrollTo(0, 0)
      return
    }

    navigate({
      pathname: '/developers',
      search: `?doc=${encodeURIComponent(section.docId)}`,
      hash: nextHash,
    })
  }

  return (
    <div className="developer-hub site-shell">
      <title>{activeDoc ? `${activeDoc.label} — OpenSwap Docs` : 'Developers — OpenSwap'}</title>
      <div className="developer-hub__mobile-bar">
        <button
          type="button"
          onClick={() => setDocsOpen(open => !open)}
          className="developer-hub__mobile-toggle"
          aria-expanded={docsOpen}
          aria-controls="developer-docs-sidebar"
        >
          {docsOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          <span>{activeDoc?.label || 'Explore documentation'}</span>
        </button>
        <button
          type="button"
          className="developer-hub__mobile-search"
          onClick={() => setSearchOpen(true)}
          onFocus={loadSearchDialog}
          aria-label="Search docs"
          aria-haspopup="dialog"
        >
          <Search size={17} aria-hidden="true" />
        </button>
      </div>

      <aside
        id="developer-docs-sidebar"
        className={`app-docs-sidebar developer-hub__sidebar ${docsOpen ? 'is-open' : ''}`}
      >
        <div className="developer-hub__sidebar-heading">
          <p className="section-label">// Documentation</p>
          <p>Explore OpenSwap</p>
          <button
            type="button"
            className="docs-search-trigger"
            onClick={() => setSearchOpen(true)}
            onPointerEnter={loadSearchDialog}
            onFocus={loadSearchDialog}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search size={16} aria-hidden="true" />
            <span>Search docs</span>
            <kbd aria-hidden="true">{SHORTCUT_LABEL}</kbd>
          </button>
        </div>
        <DocsSidebar
          nav={DEVELOPER_DOCS_NAV}
          activeDocId={activeDoc?.docId || null}
          onSelect={handleDocSelect}
        />
      </aside>

      <main className="portal-page developer-hub__main">
        {activeDoc ? (
          <article id="documentation" className="developer-hub__document scroll-mt-28">
            <Link to="/developers" className="developer-hub__back">
              <ArrowLeft size={15} aria-hidden="true" />
              Developer overview
            </Link>
            <DocsContent activeDoc={activeDoc} />
          </article>
        ) : (
          <>
            <PageHero
              eyebrow="Developers"
              title="Build with OpenSwap"
              description="Use the Rust core directly or bring the Wallet workflow into an existing desktop, mobile, or server application through maintained language bindings."
            >
              <ExternalTextLink href={LINKS.openswap_repo}>Open core repository</ExternalTextLink>
              <ExternalTextLink href={LINKS.openswap_ffi}>Explore the FFIs</ExternalTextLink>
            </PageHero>

            <section className="portal-section portal-section--split">
              <div>
                <p className="section-label mb-3">// Start from source</p>
                <h2 className="portal-section__title font-display font-semibold text-cream">The protocol, without a wrapper</h2>
                <p className="portal-copy mt-4 text-cream/68">
                  The OpenSwap repository contains the Wallet client, Router daemon, Router CLI, and the shared Rust implementation.
                  Build it directly when you need the complete command-line workflow or want to contribute to the protocol.
                </p>
                <div className="portal-requirements mt-7">
                  <span>Rust ≥ 1.75</span>
                  <span>Bitcoin Core: synced, non-pruned, txindex</span>
                  <span>Tor daemon</span>
                </div>
              </div>
              <CodeBlock code={BUILD_COMMAND} language="bash" className="portal-code" />
            </section>

            <section className="portal-section">
              <div className="portal-section__heading">
                <div>
                  <p className="section-label mb-3">// Language bindings</p>
                  <h2 className="portal-section__title font-display font-semibold text-cream">Use OpenSwap where your users already are</h2>
                </div>
                <p className="portal-copy max-w-xl text-cream/65">
                  <code className="inline-code">openswap-ffi</code> exposes the Wallet workflow across desktop, mobile, and server-side environments.
                </p>
              </div>

              <div className="ffi-grid mt-8">
                {FFI_LINKS.map(({ name, support, description, href }, index) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="ffi-card group">
                    <span className="ffi-card__index">0{index + 1}</span>
                    <div className="ffi-card__body">
                      <p className="ffi-card__support">{support}</p>
                      <h3 className="ffi-card__title font-display font-semibold text-cream">{name}</h3>
                      <p className="ffi-card__copy text-cream/65">{description}</p>
                    </div>
                    <ArrowRight className="ffi-card__arrow" size={18} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {searchOpen && (
        <Suspense fallback={null}>
          <DocsSearchDialog onClose={() => setSearchOpen(false)} onSelect={handleSearchSelect} />
        </Suspense>
      )}
    </div>
  )
}
