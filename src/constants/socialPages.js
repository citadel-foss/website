const SITE_URL = 'https://openswap.live'

export const SOCIAL_PAGES = {
  '/': {
    title: 'OpenSwap — A Decentralized Atomic-Swap Marketplace',
    description: 'A sybil-resistant, decentralized marketplace for trustless atomic swaps, hosted in the Bitcoin blockchain and discoverable over Nostr.',
    image: `${SITE_URL}/social-preview.png`,
    imageAlt: 'OpenSwap: decentralized, non-custodial atomic swaps',
  },
  '/market': {
    title: 'Market — OpenSwap',
    description: 'Explore the OpenSwap Router market: liquidity, fidelity bonds, public fees, and Tor addresses.',
    image: `${SITE_URL}/social/market.png`,
    imageAlt: 'OpenSwap Market: explore Router liquidity and offers',
  },
  '/portal': {
    title: 'Portal — OpenSwap',
    description: 'Use the OpenSwap Wallet and Router Console in one desktop or self-hosted app.',
    image: `${SITE_URL}/social/portal.png`,
    imageAlt: 'OpenSwap Portal: one app for Wallet and Router operations',
  },
  '/developers': {
    title: 'Developers — OpenSwap',
    description: 'Build with the OpenSwap Rust core, language bindings, and protocol documentation.',
    image: `${SITE_URL}/social/developers.png`,
    imageAlt: 'OpenSwap Developers: Rust core, language bindings, and documentation',
  },
}

export function socialPageFor(pathname) {
  const requestedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
  const path = SOCIAL_PAGES[requestedPath] ? requestedPath : '/'
  const page = SOCIAL_PAGES[path]
  return {
    ...page,
    url: `${SITE_URL}${path === '/' ? '/' : `${path}/`}`,
  }
}
