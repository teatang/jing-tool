# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cross-platform desktop tool collection built with Electron, Vue 3, and TypeScript.

**String Tools**: Base64, URL, JSON, HTML, SQL formatting, Regex testing
**File Tools**: Batch rename, File search
**Game**: Tetris (7 tetromino shapes, next piece preview, ghost piece, score/level system, dark/light theme)

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server with HMR
pnpm build            # Build for production (includes typecheck)
pnpm build:mac        # Build macOS DMG
pnpm build:win        # Build Windows installer
pnpm build:linux      # Build Linux AppImage
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm typecheck        # Type-check both main and renderer
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once and exit
pnpm test:ui          # Run tests with browser UI
```

## Project Commands After Changes

After modifying code, always run:

```bash
pnpm format && pnpm lint && pnpm test
```

## Architecture

Three-part Electron structure:

- **`src/main/index.ts`** - Main process (Node.js). Creates BrowserWindow, handles app lifecycle, IPC handlers.
- **`src/preload/index.ts`** - Preload script. Exposes file operation APIs via `contextBridge`.
- **`src/renderer/src`** - Vue 3 frontend. Mounted to DOM, communicates with main via `window.api`.

## Key Paths

- `@renderer` alias maps to `src/renderer/src`
- Resources (icons) in `resources/`
- Build configs in `build/`

## UI Components

- **Element Plus** - Main UI component library
- **Element Plus Icons Vue** - Icon components

## Testing

- **Vitest** - Test framework
- **Happy-dom** - DOM environment for tests
- Test files located in `src/**/*.test.ts` and `src/**/*.spec.ts`

## TypeScript Configuration

- `tsconfig.node.json` - Main/preload (Node.js globals like `__dirname`)
- `tsconfig.web.json` - Renderer (browser globals)

## Important Notes

- Always use `value` instead of `label` for Element Plus `el-radio-button`
- Use `router.push()` for navigation (not `router-link`)
- Icons: Use `Lock`/`Unlock` instead of non-existent `Encode`/`Decode`
- Theme CSS variables: `element-plus/theme-chalk/dark/css-vars.css`
- File operations exposed via `window.api`: selectFolder, readDir, renameFile, batchRename, searchFiles, deleteFiles
- Routes use hash mode (`createWebHashHistory`) for file:// protocol compatibility
- Game route: `/tools/game/tetris` → Tetris game (TetrisGame.vue)
