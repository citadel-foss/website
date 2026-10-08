// src/constants/links.js
// All external URLs in one place. Never hardcode these elsewhere.

const PORTAL_MASTER_DOWNLOADS = "https://github.com/citadel-foss/portal/releases/download/0.1.0-beta"

export const LINKS = {
  // Core repos
  github_org:       "https://github.com/citadel-foss",
  openswap_repo:    "https://github.com/citadel-foss/openswap",
  portal_repo:      "https://github.com/citadel-foss/portal",
  portal_releases:  "https://github.com/citadel-foss/portal/releases",
  // Fixed names are replaced by each successful OpenSwap master compatibility build.
  portal_linux_x86_64_appimage: `${PORTAL_MASTER_DOWNLOADS}/portal-linux-x86_64.AppImage`,
  portal_linux_x86_64_deb: `${PORTAL_MASTER_DOWNLOADS}/portal-linux-x86_64.deb`,
  portal_linux_x86_64_rpm: `${PORTAL_MASTER_DOWNLOADS}/portal-linux-x86_64.rpm`,
  portal_macos_universal_app: `${PORTAL_MASTER_DOWNLOADS}/portal-macos-universal.app.tar.gz`,
  portal_macos_universal_dmg: `${PORTAL_MASTER_DOWNLOADS}/portal-macos-universal.dmg`,
  portal_server_linux_arm64: `${PORTAL_MASTER_DOWNLOADS}/portal-server-linux-arm64.tar.gz`,
  portal_server_linux_x86_64: `${PORTAL_MASTER_DOWNLOADS}/portal-server-linux-x86_64.tar.gz`,
  portal_server_macos_universal: `${PORTAL_MASTER_DOWNLOADS}/portal-server-macos-universal.tar.gz`,
  tauri_prerequisites: "https://tauri.app/start/prerequisites/",
  taker_app:        "https://github.com/citadel-foss/taker-app",
  maker_dashboard:  "https://github.com/citadel-foss/maker-dashboard",
  maker_dashboard_packaging: "https://github.com/citadel-foss/maker-dashboard/tree/main/packaging",
  openswap_ffi:     "https://github.com/citadel-foss/openswap-ffi",
  mill_io:          "https://github.com/citadel-foss/mill-io",
  rust_coinselect:  "https://github.com/citadel-foss/rust-coinselect",

  // Docs & spec
  taker_docs:        "https://github.com/citadel-foss/openswap/blob/master/docs/taker.md",
  makerd_docs:       "https://github.com/citadel-foss/openswap/blob/master/docs/makerd.md",
  maker_cli_docs:    "https://github.com/citadel-foss/openswap/blob/master/docs/maker-cli.md",
  maker_docker_docs: "https://github.com/citadel-foss/openswap/blob/master/docs/docker.md",
  bitcoin_conf_sample: "https://github.com/citadel-foss/openswap/blob/master/docs/bitcoin.conf",
  tor_docs:          "https://github.com/citadel-foss/openswap/blob/master/docs/tor.md",
  protocol_spec:    "https://github.com/citadel-foss/OpenSwap-Protocol-Specification",
  protocol_v2:      "https://github.com/citadel-foss/OpenSwap-Protocol-Specification/tree/main/v2%20protocol",
  protocol_flow:    "https://github.com/citadel-foss/OpenSwap-Protocol-Specification/blob/main/v1%20protocol/protocol-flow.md",
  protocol_legacy_contract: "https://github.com/citadel-foss/OpenSwap-Protocol-Specification/blob/main/v1%20protocol/contract.md",
  protocol_taproot_contract: "https://github.com/citadel-foss/OpenSwap-Protocol-Specification/blob/main/v2%20protocol/contract.md",
  protocol_payswap: "https://github.com/citadel-foss/OpenSwap-Protocol-Specification/blob/main/general%20specs/payswap.md",
  portal_development_docs: "https://github.com/citadel-foss/portal/blob/main/docs/DEVELOPMENT.md",
  releases:         "https://github.com/citadel-foss/openswap/releases",
  contributing:     "https://github.com/citadel-foss/openswap/blob/master/CONTRIBUTING.md",
  issues:           "https://github.com/citadel-foss/openswap/issues",

  // Community (Matrix alias as published on the org profile — "ciatdel" is intentional)
  matrix:           "https://matrix.to/#/#ciatdel-foss:matrix.org",

  // Testnet (Signet)
  signet:        "https://mempool.openswap.live/",
  signet_faucet: "https://faucet.openswap.live/",

  // Market data
  market_mainnet_makers_api: "https://market.openswap.live/api/mainnet/makers",
  market_mainnet_health_api: "https://market.openswap.live/api/mainnet/health",
  market_mainnet_explorer_tx_base: "https://mempool.space/tx",
  market_signet_makers_api: "https://market.openswap.live/api/makers",
  market_signet_health_api: "https://market.openswap.live/api/health",
  market_signet_explorer_tx_base: "https://mempool.openswap.live/tx",

  // Taker App screenshots (vendored from the taker-app repo — GitHub raw
  // hotlinks get rate-limited, which intermittently broke the preview)
  screenshot_wallet:  `${import.meta.env.BASE_URL}taker-app/wallet.png`,
  screenshot_swap:    `${import.meta.env.BASE_URL}taker-app/swap.png`,
  screenshot_swap1:   `${import.meta.env.BASE_URL}taker-app/swap1.png`,
  screenshot_report:  `${import.meta.env.BASE_URL}taker-app/report1.png`,

  // Docs raw content bases
  docs_manuals_base:          'https://raw.githubusercontent.com/citadel-foss/openswap/master/docs',
  docs_demo:                  'https://raw.githubusercontent.com/citadel-foss/openswap/master/docs/demo.md',
  docs_examples_base:         'https://raw.githubusercontent.com/citadel-foss/openswap/master/examples',
  docs_spec_base:             'https://raw.githubusercontent.com/citadel-foss/OpenSwap-Protocol-Specification/main',
  docs_portal_base:           'https://raw.githubusercontent.com/citadel-foss/portal/main/docs',
  docs_ffi_base:              'https://raw.githubusercontent.com/citadel-foss/openswap-ffi/main',
  docs_taker_app_usage:       'https://raw.githubusercontent.com/citadel-foss/taker-app/main/docs/usage.md',
  docs_maker_dashboard_arch:  'https://raw.githubusercontent.com/citadel-foss/maker-dashboard/main/README.md',
  docs_maker_dashboard_packaging_base: 'https://raw.githubusercontent.com/citadel-foss/maker-dashboard/main/packaging',

  // FFI GitHub repo links (for "view on GitHub" buttons)
  ffi_js_repo:     'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-js',
  ffi_python_repo: 'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-python',
  ffi_kotlin_repo: 'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-kotlin',
  ffi_react_native_repo: 'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-react-native',
  ffi_swift_repo:  'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-swift',
  ffi_ruby_repo:   'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-ruby',
  ffi_csharp_repo: 'https://github.com/citadel-foss/openswap-ffi/tree/main/openswap-csharp',
  maker_dashboard_mynode_repo: 'https://github.com/citadel-foss/maker-dashboard/tree/main/packaging/mynode',
  maker_dashboard_umbrel_repo: 'https://github.com/citadel-foss/maker-dashboard/tree/main/packaging/umbrel',
};
