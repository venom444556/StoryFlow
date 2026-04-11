# graph-renderer

Canvas or WebGL force-directed graph React component. Dense node count, cluster-based coloring, smooth physics simulation, file tree sidebar, and filter controls. Visual target: the GitNexus production UI (dark theme, neon-tinted node clusters, curved edges, interactive filters).

Must match the StoryFlow aesthetic — `obsidian-dark` theme by default, with a `warm-linen` light theme toggle. Design tokens come from `src/styles/tokens.css` in the StoryFlow root once integrated, but for the standalone build, ship a copy of the relevant tokens inside this module so it can be demoed in isolation.

## Responsibilities

1. Render the graph defined by `nodes`, `edges`, and `clusters` props at interactive framerates.
2. Apply a force-directed layout that converges quickly for 100-300 nodes and remains stable under interaction (drag, zoom, pan).
3. Color nodes by cluster. Size nodes by in-degree (how many others call them) by default.
4. Provide a collapsible file-tree sidebar on the left that lists files/folders in the current codebase, derived from the `clusters` prop.
5. Provide filter controls: by cluster, by ticket, by blast radius, by search term.
6. Emit `onNodeClick` and `onClusterClick` events for the host application to open detail panels.
7. Support both `obsidian-dark` and `warm-linen` themes. Theme changes must not remount.

## Non-goals

- Does not fetch data. All data comes in via props.
- Does not know about StoryFlow tickets directly — it receives `ticketKeys` as opaque filter hints, nothing more.
- Does not persist layout or viewport state to disk.

## Rendering technology

- **Canvas or WebGL only.** SVG is explicitly disallowed for the main graph surface because it cannot hit the performance target.
- Recommended libraries: `react-force-graph-2d` (canvas), `react-force-graph-3d` (WebGL), or `cytoscape.js` with the canvas renderer. Pick one, justify briefly in the module README.
- The file-tree sidebar may use DOM/React — it is not performance critical.

## Performance requirements

- 300 nodes + 600 edges must render at 60fps on a 2020 MacBook Air after initial layout convergence.
- Initial force-directed layout must converge in under 2 seconds for 300 nodes.
- Viewport pan/zoom must be smooth (no dropped frames) at 300 nodes.

## Acceptance criteria

1. All contract tests in `CONTRACTS.md > graph-renderer` pass.
2. A Storybook or equivalent demo page renders three fixture graphs: small (10 nodes), medium (100 nodes), large (300 nodes). The demo page is launched with `npm run demo` and works standalone — no StoryFlow required.
3. A performance test documents the framerate observed on the 300-node fixture.
4. The visual output on the large fixture is visibly comparable to the GitNexus reference screenshot stored at `/Users/devserver/Desktop/Screenshot 2026-04-10 at 5.55.19 PM.png` (dense cluster-colored graph, physics simulation, file tree sidebar).

## Tooling expectations

- `package.json` with its own React dependency.
- ESM only.
- Vitest + React Testing Library for unit tests.
- Playwright or similar for the performance test.
- A `USAGE.md` and a runnable `npm run demo` that boots the demo page locally.
