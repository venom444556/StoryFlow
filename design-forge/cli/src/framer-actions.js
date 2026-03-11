// ---------------------------------------------------------------------------
// Framer Actions — High-level Framer operations composed from CDP primitives
// ---------------------------------------------------------------------------

// --- Keyboard shortcuts (Framer's built-in) ---

const ELEMENT_SHORTCUTS = {
  frame: 'f',
  text: 't',
  stack: 's',
  link: 'l',
  image: 'i',
  video: 'v',
  code: 'c',
}

// --- Element insertion ---

export async function insertElement(client, type) {
  const key = ELEMENT_SHORTCUTS[type.toLowerCase()]
  if (!key) {
    throw new Error(
      `Unknown element type: ${type}. Use: ${Object.keys(ELEMENT_SHORTCUTS).join(', ')}`
    )
  }
  // Press the shortcut key to insert
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    text: key,
  })
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
  })
  // Brief pause for Framer to create the element
  await sleep(200)
}

// --- Text content ---

export async function setTextContent(client, text) {
  // Double-click to enter text edit mode, select all, then type
  await client.keyCombo(['Meta', 'a'])
  await sleep(100)
  await client.type(text)
}

// --- Style application ---

export async function applyStyle(client, properties) {
  // Use Framer's internal API to apply styles to the selected element
  // This is more reliable than clicking through the UI
  const script = `
    (() => {
      const sel = __framer_selection?.();
      if (!sel || sel.length === 0) return { error: 'No element selected' };
      // Apply style properties through Framer's internal mutation API
      const node = sel[0];
      const props = ${JSON.stringify(properties)};
      for (const [key, value] of Object.entries(props)) {
        if (node.style) node.style[key] = value;
      }
      return { applied: Object.keys(props).length };
    })()
  `
  return client.evaluate(script)
}

// --- Canvas state ---

export async function readCanvasState(client, depth = 2) {
  const script = `
    (() => {
      function walk(el, d) {
        if (d <= 0) return { tag: el.tagName, childCount: el.children.length };
        const result = {
          tag: el.tagName,
          id: el.id || undefined,
          className: el.className || undefined,
          testId: el.getAttribute?.('data-testid') || undefined,
          rect: el.getBoundingClientRect ? (() => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          })() : undefined,
          children: Array.from(el.children).map(c => walk(c, d - 1)),
        };
        return result;
      }
      return walk(document.body, ${depth});
    })()
  `
  return client.evaluate(script)
}

// --- Selection ---

export async function getSelection(client) {
  const script = `
    (() => {
      // Try Framer's internal selection API
      if (typeof __framer_selection === 'function') {
        const sel = __framer_selection();
        return sel?.map(n => ({
          id: n.id,
          type: n.type,
          name: n.name,
          props: n.props,
        })) || [];
      }
      // Fallback: check for selected element indicators in DOM
      const selected = document.querySelector('[data-selected="true"]');
      if (selected) {
        const rect = selected.getBoundingClientRect();
        return [{
          tag: selected.tagName,
          id: selected.id,
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        }];
      }
      return [];
    })()
  `
  return client.evaluate(script)
}

// --- Layout ---

export async function setLayout(client, direction, options = {}) {
  const { gap, padding, align, justify } = options
  const style = {}
  style.display = 'flex'
  style.flexDirection = direction === 'horizontal' ? 'row' : 'column'
  if (gap !== undefined) style.gap = `${gap}px`
  if (padding !== undefined) style.padding = `${padding}px`
  if (align) style.alignItems = align
  if (justify) style.justifyContent = justify
  return applyStyle(client, style)
}

// --- Move/resize ---

export async function moveElement(client, x, y, width, height) {
  const style = {}
  if (x !== undefined) style.left = `${x}px`
  if (y !== undefined) style.top = `${y}px`
  if (width !== undefined) style.width = `${width}px`
  if (height !== undefined) style.height = `${height}px`
  return applyStyle(client, style)
}

// --- Project creation ---

export async function createProject(client, template) {
  // Navigate to Framer dashboard
  await client.send('Page.navigate', { url: 'https://framer.com/projects' })
  await sleep(2000)

  // Click the "New Project" button
  await client.evaluate(`
    document.querySelector('[data-testid="new-project-button"]')?.click()
    || document.querySelector('button[aria-label*="New"]')?.click()
  `)
  await sleep(1000)

  if (template && template !== 'blank') {
    // Search for template
    await client.evaluate(`
      const search = document.querySelector('[data-testid="template-search"]')
        || document.querySelector('input[placeholder*="Search"]');
      if (search) { search.focus(); search.value = ${JSON.stringify(template)}; search.dispatchEvent(new Event('input', { bubbles: true })); }
    `)
    await sleep(500)
  }
}

// --- Navigate ---

export async function navigateToUrl(client, url) {
  await client.send('Page.navigate', { url })
  await sleep(2000)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
