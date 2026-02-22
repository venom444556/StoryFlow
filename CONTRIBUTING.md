# Contributing to StoryFlow

Thanks for your interest in contributing. Here's how to get started.

## Fork & Clone

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/StoryFlow.git
cd StoryFlow

# 3. Add upstream remote
git remote add upstream https://github.com/venom444556/StoryFlow.git

# 4. Install and run
npm install
npm run dev:full
```

This starts the Express API server on port 3001 and the Vite dev server on port 3000. Open http://localhost:3000 in your browser.

## Making Changes

```bash
# Create a branch off main
git checkout -b your-feature-name

# Make your changes, then run the quality gate
npm run ci

# Commit and push to your fork
git push origin your-feature-name
```

Then open a pull request against `main`.

## Quality Gate

All code must pass before merge:

```bash
npm run ci
```

This runs, in order:

1. `format:check` — Prettier formatting
2. `lint` — ESLint with React rules
3. `typecheck` — TypeScript type checking
4. `test:run` — Vitest test suite
5. `build` — Vite production build

## Pre-Commit Hooks

Husky runs lint-staged on every commit, which auto-fixes formatting and lint issues on staged files. If the hook fails, fix the issues before committing.

## Code Style

- JavaScript/JSX (not TypeScript for source files)
- Prettier formatting (no semicolons, single quotes, 100 char width)
- ESLint with React hooks rules
- Tailwind CSS v4 for styling
- Framer Motion for animations

## Testing

Tests use Vitest with React Testing Library. Test files live alongside source files with `.test.jsx` or `.test.js` extension.

```bash
npm run test           # Watch mode
npm run test:run       # Single run (CI)
npm run test:coverage  # With coverage
```

## Project Structure

Source code lives in `src/`. See the [README](README.md) for the full directory layout.
