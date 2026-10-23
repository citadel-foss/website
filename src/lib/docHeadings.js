// Heading ids shared by the docs renderer and the docs search index, so a
// search result always links to the exact id that ends up in the page.

export function headingText(tokens) {
  return tokens.map(token => token.tokens ? headingText(token.tokens) : token.text || '').join('')
}

// Returns a function that turns heading text into a GitHub-style id,
// adding -1, -2, ... to repeated headings. Create one per document.
export function createHeadingIds() {
  const used = new Set()

  return function nextHeadingId(text) {
    const baseId = text.toLowerCase().trim()
      .replace(/[\u2000-\u206f\u2e00-\u2e7f\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
      .replace(/\s/g, '-')
    let id = baseId
    let suffix = 1
    while (used.has(id)) id = `${baseId}-${suffix++}`
    used.add(id)
    return id
  }
}
