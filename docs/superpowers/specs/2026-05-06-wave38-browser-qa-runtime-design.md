# Wave 38 Browser QA Runtime Design

## Context

Wave 37 full visual-smoke verification initially failed because Playwright's `webServer.command` launched `npm run dev`, which used the shell `node` v18.19.1. This project requires Node 24 for autonomous worktrees, and Vite 8 refuses to run on Node 18. Holding open a Vite server launched with the bundled Node v24.14.0 made the same visual-smoke and playable-flow gates pass.

Evidence:

- `node -v` in the shell returned `v18.19.1`.
- `npm run dev -- --port 5173` failed with Vite's Node version warning and `ReferenceError: CustomEvent is not defined`.
- Manual bundled-node Vite server probing returned `.inkblade-app[data-runtime="ready"]` and `start-run` enabled.

## Design

Make Playwright's web server command use the same Node executable that launched Playwright:

```ts
const viteWebServerCommand = `${quoteCommandPart(process.execPath)} ${quoteCommandPart("./node_modules/vite/bin/vite.js")} --host 127.0.0.1 --port 5173`;
```

This keeps the repo portable: developers using a valid local Node use that Node, while autonomous runs using the bundled Node v24 automatically start Vite with the bundled Node. It avoids hardcoding a user-specific path.

## Testing

Add a focused Vitest config test that imports `playwright.config.ts` and asserts:

- the command includes `process.execPath`;
- the command launches `node_modules/vite/bin/vite.js`;
- the command does not call `npm run dev`;
- host, port, URL, and `reuseExistingServer` remain unchanged.

Then run a Playwright focused browser test without manually keeping a Vite server open. This proves Playwright can now start its own dev server under the current Node runtime.

## Out Of Scope

- Changing package manager, installing a new Node, or editing user shell configuration.
- Steam/storefront/release packaging.
- Browser test content changes unrelated to the runtime launcher.
