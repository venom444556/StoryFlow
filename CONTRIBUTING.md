# Contributing to StoryFlow

## Development Setup

```bash
git clone https://github.com/venom444556/StoryFlow.git
cd StoryFlow
npm install
npm run dev:full
```

This starts the Express API server on port 3001 and the Vite dev server on port 3000. Open http://localhost:3000 in your browser.

## Quality Gate

All code must pass the unified quality gate before merge:

```bash
npm run ci
```

This runs, in order:

1. `format:check` — Prettier formatting verification
2. `lint` — ESLint with React rules
3. `typecheck` — TypeScript type checking
4. `test:run` — Vitest test suite
5. `build` — Vite production build

## Running Individual Checks

```bash
npm run format:check   # Check formatting
npm run format         # Auto-fix formatting
npm run lint           # Check lint rules
npm run lint:fix       # Auto-fix lint issues
npm run typecheck      # Type checking
npm run test           # Tests in watch mode
npm run test:run       # Tests single run
npm run test:coverage  # Tests with coverage report
npm run build          # Production build
```

## Pre-Commit Hooks

Husky runs lint-staged on every commit, which auto-fixes formatting and lint issues on staged files. If the hook fails, fix the issues before committing.

## Project Structure

Source code lives in `src/`. See the [README](README.md) for the full directory layout.

## Code Style

- JavaScript/JSX (not TypeScript)
- Prettier formatting (no semicolons, single quotes, 100 char width)
- ESLint with React hooks rules
- Tailwind CSS v4 for styling
- Framer Motion for animations

## Developer Certificate of Origin

By contributing to StoryFlow you agree to the [Developer Certificate of Origin (DCO)](https://developercertificate.org). Sign off your commits with the `-s` flag:

```bash
git commit -s -m "your commit message"
```

This adds a `Signed-off-by: Your Name <email@example.com>` line to your commit. Pull requests without DCO sign-off will fail the automated DCO check. To sign off a previous commit retroactively: `git commit --amend -s`.

## Testing

Tests use Vitest with React Testing Library. Test files live alongside source files with `.test.jsx` or `.test.js` extension.

```bash
npm run test           # Watch mode
npm run test:run       # Single run (CI)
npm run test:coverage  # With coverage
```
