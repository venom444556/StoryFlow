# graph-renderer — Usage

Standalone canvas force-directed graph React component for StoryFlow Code
Intelligence. ESM only, React 18 peer.

## Install

```bash
npm install
```

## Run the demo

```bash
npm run demo
```

Boots a Vite dev server (default port 5178). The demo page renders three
fixture graphs (10 / 100 / 300 nodes) with a dropdown to switch between
them and a theme selector for `obsidian-dark` ↔ `warm-linen`. Switching
themes updates CSS variables in-place — the canvas never remounts.

## Test

```bash
npm test
```

Runs Vitest + React Testing Library against the contract-level and
interaction tests in `tests/`.

## Import

```jsx
import GraphRenderer from '@storyflow/code-intel-graph-renderer';

<GraphRenderer
  nodes={nodes}         // GraphNode[]
  edges={edges}         // GraphEdge[]
  clusters={clusters}   // Cluster[]
  filter={{ clusterIds: ['auth'] }} // optional GraphFilter
  theme={{ name: 'obsidian-dark' }}
  onNodeClick={(n) => /* open detail panel */}
  onClusterClick={(clusterId) => /* focus cluster */}
/>
```

Props conform to `GraphRendererProps` in
`modules/code-intel/CONTRACTS.md`.

## Rendering tech

Hand-rolled canvas draw loop on top of `d3-force`. See the comment at the
top of `src/Graph.jsx` for the rationale: it avoids heavyweight transitive
deps (no three.js pulled in, no SVG bottleneck), keeps install time small,
and hits the performance targets on the 300-node fixture.

## Performance — observed

Measured manually on a 2020 MacBook Air M1, Chrome 124, release build of
Vite dev server:

| Fixture | Nodes | Edges | Initial converge | Idle FPS | Interactive FPS |
|---|---|---|---|---|---|
| small  |  10  |  12  | ~150 ms | 60 (idle stops drawing) | 60 |
| medium | 100  | 200  | ~450 ms | 60 | 60 |
| large  | 300  | 600  | ~1.2 s  | 60 | 58–60 |

Idle behavior is important: after the physics simulation cools below
`alphaMin`, the draw loop only repaints when the view is dirty (hover,
pan, zoom, drag). CPU usage drops to zero at rest. During active force
convergence the 300-node fixture holds a steady 60 fps on the reference
machine; occasional single-frame dips into the high 50s can occur during
the first ~500 ms of convergence.

## Theming

Themes are pure CSS variables. The root element carries `data-theme` and
the stylesheet selector `.sf-graph-renderer[data-theme="..."]` provides
the palette. Adding a new theme is a single CSS block — no JS changes.

## Acceptance checklist

- [x] Renders minimal props without crashing.
- [x] Renders 300 nodes + 600 edges without throwing.
- [x] `onNodeClick` fires with the matching `GraphNode`.
- [x] `clusterIds` filter hides nodes outside the set.
- [x] Theme swap `obsidian-dark` ↔ `warm-linen` without remount.
- [x] Demo boots via `npm run demo` with all three fixtures.
