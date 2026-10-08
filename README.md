# OpenSwap Website

Marketing and documentation site for [OpenSwap](https://github.com/citadel-foss/openswap) — an Atomic-Swap protocol using Taproot + MuSig2 over a decentralized censorship-resistant marketplace.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- react-syntax-highlighter (code blocks)
- Deployed via GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build      # production build → dist/
npm run preview    # preview production build locally
npm run deploy     # manual fallback deploy to gh-pages branch
```

Automatic deploys run through GitHub Actions on every push to `main`.

Live site: https://openswap.live/

One-time GitHub setup:

- Go to `Settings` -> `Pages`
- Set `Source` to `GitHub Actions`
- Keep the default workflow permissions enabled for Pages deployment

## Project Structure

```text
src/
├── components/
│   ├── layout/    Header.jsx, Footer.jsx, Layout.jsx
│   ├── ui/        Button, Badge, Card, CodeBlock, TabGroup, Collapsible
│   └── home/      Hero, StatusBanner, RoleCards, SwapFlowDiagram, QuickLinks
├── pages/         Home, HowItWorks, Takers, Makers, Docs, NotFound
├── constants/     links.js   ← all external URLs live here
├── hooks/         useLatestRelease.js
└── assets/icons/
```

## Pages

| Path            | Page          |
|-----------------|---------------|
| `/`             | Home          |
| `/how-it-works` | How It Works  |
| `/takers`       | Takers        |
| `/makers`       | Makers        |
| `/docs`         | Docs          |

## Links

All external URLs are defined in `src/constants/links.js`. Never hardcode GitHub or external URLs elsewhere.
