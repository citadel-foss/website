import { LINKS } from './links.js'

const base     = LINKS.docs_manuals_base
const exBase   = LINKS.docs_examples_base
const specBase = LINKS.docs_spec_base
const portalBase = LINKS.docs_portal_base
const ffiBase  = LINKS.docs_ffi_base
const makerDashboardPackagingBase = LINKS.docs_maker_dashboard_packaging_base

export const NAV = [
  {
    id: 'get-started',
    label: 'Get Started',
    static: true,
  },
  {
    id: 'manuals',
    label: 'Manuals',
    items: [
      { label: 'Taker',      url: `${base}/taker.md` },
      { label: 'Makerd',     url: `${base}/makerd.md` },
      { label: 'Maker CLI',  url: `${base}/maker-cli.md` },
      { label: 'Bitcoind',   url: `${base}/bitcoind.md` },
      { label: 'Tor',        url: `${base}/tor.md` },
      { label: 'Docker',     url: `${base}/docker.md` },
      { label: 'Taproot',    url: `${base}/taproot.md` },
      { label: 'Demo',       url: `${base}/demo.md` },
    ],
  },
  {
    id: 'general-specs',
    label: 'General Specs',
    items: [
      { label: 'Introduction', url: `${specBase}/general%20specs/introduction.md` },
      { label: 'Architecture', url: `${specBase}/general%20specs/architecture.md` },
      { label: 'Fees',         url: `${specBase}/general%20specs/fees.md` },
      { label: 'Fidelity',     url: `${specBase}/general%20specs/fidelity.md` },
      { label: 'Privacy',      url: `${specBase}/general%20specs/privacy.md` },
      { label: 'Security',     url: `${specBase}/general%20specs/security.md` },
      { label: 'PaySwap',      url: `${specBase}/general%20specs/payswap.md`, repoUrl: LINKS.protocol_payswap },
    ],
  },
  {
    id: 'v1-protocol',
    label: 'V1 Protocol',
    items: [
      { label: 'Protocol Flow', url: `${specBase}/v1%20protocol/protocol-flow.md` },
      { label: 'Contract',      url: `${specBase}/v1%20protocol/contract.md` },
      { label: 'Messages',      url: `${specBase}/v1%20protocol/messages.md` },
    ],
  },
  {
    id: 'v2-protocol',
    label: 'V2 Protocol',
    items: [
      { label: 'Protocol Flow', url: `${specBase}/v2%20protocol/protocol-flow.md` },
      { label: 'Contract',      url: `${specBase}/v2%20protocol/contract.md` },
      { label: 'Messages',      url: `${specBase}/v2%20protocol/messages.md` },
    ],
  },
  {
    id: 'examples',
    label: 'Examples',
    items: [
      { label: 'Taker Basic',  url: `${exBase}/taker_basic.rs`,  lang: 'rust' },
      { label: 'Wallet Basic', url: `${exBase}/wallet_basic.rs`, lang: 'rust' },
    ],
  },
  {
    id: 'ffis',
    label: 'FFIs',
    items: [
      { label: 'JavaScript', url: `${ffiBase}/openswap-js/README.md`,     repoUrl: LINKS.ffi_js_repo },
      { label: 'Python',     url: `${ffiBase}/openswap-python/README.md`, repoUrl: LINKS.ffi_python_repo },
      { label: 'Kotlin',     url: `${ffiBase}/openswap-kotlin/README.md`, repoUrl: LINKS.ffi_kotlin_repo },
      { label: 'React Native', url: `${ffiBase}/openswap-react-native/README.md`, repoUrl: LINKS.ffi_react_native_repo },
      { label: 'Swift',      url: `${ffiBase}/openswap-swift/README.md`,  repoUrl: LINKS.ffi_swift_repo },
      { label: 'Ruby',       url: `${ffiBase}/openswap-ruby/README.md`,   repoUrl: LINKS.ffi_ruby_repo },
    ],
  },
  {
    id: 'guis',
    label: 'GUIs',
    items: [
      { label: 'Taker App',       url: LINKS.docs_taker_app_usage,      repoUrl: LINKS.taker_app },
      { label: 'Maker Dashboard', url: LINKS.docs_maker_dashboard_arch, repoUrl: LINKS.maker_dashboard },
    ],
  },
  {
    id: 'dockers',
    label: 'Docker',
    items: [
      {
        label: 'myNode',
        url: `${makerDashboardPackagingBase}/mynode/README.md`,
        repoUrl: LINKS.maker_dashboard_mynode_repo,
      },
      {
        label: 'Umbrel',
        url: `${makerDashboardPackagingBase}/umbrel/README.md`,
        repoUrl: LINKS.maker_dashboard_umbrel_repo,
      },
    ],
  },
]

export const DEVELOPER_DOCS_NAV = [
  {
    id: 'manuals',
    label: 'Manuals',
    items: [
      { label: 'Taker', url: `${base}/taker.md` },
      { label: 'Makerd', url: `${base}/makerd.md` },
      { label: 'Maker CLI', url: `${base}/maker-cli.md` },
      { label: 'Bitcoin Core', url: `${base}/bitcoind.md` },
      { label: 'Tor', url: `${base}/tor.md` },
      { label: 'Docker', url: `${base}/docker.md` },
      { label: 'Taproot', url: `${base}/taproot.md` },
      { label: 'Lightning', url: `${base}/lightning.md` },
      { label: 'Blocklist', url: `${base}/blocklist.md` },
      { label: 'Fee Policy', url: `${base}/fee-policy.md` },
      { label: 'Wallet Security', url: `${base}/wallet-security.md` },
      { label: 'Demo', url: `${base}/demo.md` },
    ],
  },
  {
    id: 'protocol-specs',
    label: 'Protocol Specs',
    items: [
      { label: 'Introduction', url: `${specBase}/general%20specs/introduction.md` },
      { label: 'Architecture', url: `${specBase}/general%20specs/architecture.md` },
      { label: 'Fees',         url: `${specBase}/general%20specs/fees.md` },
      { label: 'Fidelity',     url: `${specBase}/general%20specs/fidelity.md` },
      { label: 'Privacy',      url: `${specBase}/general%20specs/privacy.md` },
      { label: 'Security',     url: `${specBase}/general%20specs/security.md` },
      { label: 'PaySwap',      url: `${specBase}/general%20specs/payswap.md`, repoUrl: LINKS.protocol_payswap },
      { label: 'Tor Address',  url: `${specBase}/general%20specs/tor-address.md` },
    ],
  },
  {
    id: 'v1-protocol',
    label: 'V1 Protocol',
    items: [
      { label: 'Protocol Flow', url: `${specBase}/v1%20protocol/protocol-flow.md` },
      { label: 'Contract',      url: `${specBase}/v1%20protocol/contract.md` },
      { label: 'Messages',      url: `${specBase}/v1%20protocol/messages.md` },
    ],
  },
  {
    id: 'v2-protocol',
    label: 'V2 Protocol',
    items: [
      { label: 'Protocol Flow', url: `${specBase}/v2%20protocol/protocol-flow.md` },
      { label: 'Contract',      url: `${specBase}/v2%20protocol/contract.md` },
      { label: 'Messages',      url: `${specBase}/v2%20protocol/messages.md` },
    ],
  },
  {
    id: 'ffis',
    label: 'FFIs',
    items: [
      { label: 'JavaScript', url: `${ffiBase}/openswap-js/README.md`, repoUrl: LINKS.ffi_js_repo },
      { label: 'Kotlin', url: `${ffiBase}/openswap-kotlin/README.md`, repoUrl: LINKS.ffi_kotlin_repo },
      { label: 'React Native', url: `${ffiBase}/openswap-react-native/README.md`, repoUrl: LINKS.ffi_react_native_repo },
      { label: 'Swift', url: `${ffiBase}/openswap-swift/README.md`, repoUrl: LINKS.ffi_swift_repo },
      { label: 'Python', url: `${ffiBase}/openswap-python/README.md`, repoUrl: LINKS.ffi_python_repo },
      { label: 'Ruby', url: `${ffiBase}/openswap-ruby/README.md`, repoUrl: LINKS.ffi_ruby_repo },
      { label: 'C#', url: `${ffiBase}/openswap-csharp/README.md`, repoUrl: LINKS.ffi_csharp_repo },
    ],
  },
  {
    id: 'portal',
    label: 'Portal',
    items: [
      {
        label: 'User Guide',
        url: `${portalBase}/guide.md`,
        repoUrl: LINKS.portal_guide_docs,
      },
      {
        label: 'Development',
        url: `${portalBase}/DEVELOPMENT.md`,
        repoUrl: LINKS.portal_development_docs,
      },
    ],
  },
]

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function attachDocId(section, item, subsection) {
  const prefix = subsection
    ? `${section.id}/${slugify(subsection.label)}`
    : section.id

  return {
    ...item,
    docId: `${prefix}/${slugify(item.label)}`,
  }
}

export function getNavWithDocIds(nav = NAV) {
  return nav.map(section => {
    if (section.items) {
      return {
        ...section,
        items: section.items.map(item => attachDocId(section, item)),
      }
    }

    if (section.subsections) {
      return {
        ...section,
        subsections: section.subsections.map(subsection => ({
          ...subsection,
          items: subsection.items.map(item => attachDocId(section, item, subsection)),
        })),
      }
    }

    return section
  })
}

export function findDocById(docId, nav = NAV) {
  if (!docId) return null

  for (const section of getNavWithDocIds(nav)) {
    if (section.items) {
      const match = section.items.find(item => item.docId === docId)
      if (match) return match
    }

    if (section.subsections) {
      for (const subsection of section.subsections) {
        const match = subsection.items.find(item => item.docId === docId)
        if (match) return match
      }
    }
  }

  return null
}

export function collectAllUrls(nav) {
  const urls = []
  for (const section of nav) {
    if (section.items) {
      section.items.forEach(i => urls.push(i.url))
    }
    if (section.subsections) {
      section.subsections.forEach(sub =>
        sub.items.forEach(i => urls.push(i.url))
      )
    }
  }
  return urls
}
