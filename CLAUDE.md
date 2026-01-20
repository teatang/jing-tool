# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electron application with Vue 3 and TypeScript, built using electron-vite.

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
```

## Architecture

Three-part Electron structure:

- **`src/main/index.ts`** - Main process (Node.js). Creates BrowserWindow, handles app lifecycle, IPC main handlers.
- **`src/preload/index.ts`** - Preload script. Exposes APIs to renderer via `contextBridge`. Runs in isolated context.
- **`src/renderer/src`** - Vue 3 frontend. Mounted to DOM, communicates with main via `window.electron` IPC.

**IPC Pattern**: Renderer uses `window.electron.ipcRenderer.send()` → Main process listens with `ipcMain.on()`.

## Key Paths

- `@renderer` alias maps to `src/renderer/src`
- Resources (icons) in `resources/`
- Build configs in `build/`

## TypeScript Configuration

- `tsconfig.node.json` - Main/preload (Node.js globals like `__dirname`)
- `tsconfig.web.json` - Renderer (browser globals)
