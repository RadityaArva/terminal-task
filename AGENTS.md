<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Dev environment
Node.js 18+ required. Use `npm run dev` to start development server.

## Build & test
- `npm run dev`: Start dev server.
- `npm run build`: Build production-ready app.
- `npm run start`: Run production build.
- `npm run lint`: Run ESLint.

## Conventions
- Use app directory for pages (Next.js 13+ app router).
- TypeScript files use .tsx extension.
- Tailwind classes must be purged; avoid custom CSS in favor of utility classes.

## Pitfalls
- Do not edit files in `.next` directory; they are regenerated.
- Ensure build completes before starting production server.
- Lint errors must pass before merging.