/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface Window {
  electron: {
    ipcRenderer: {
      send: (channel: string, ...args: unknown[]) => void
      on: (channel: string, listener: (...args: unknown[]) => void) => void
      once: (channel: string, listener: (...args: unknown[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
  api: {
    selectFolder: () => Promise<string | null>
    readDir: (path: string) => Promise<Array<{ name: string; isDirectory: boolean; path: string }>>
    renameFile: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
    batchRename: (
      files: Array<{ path: string; newName: string }>
    ) => Promise<Array<{ path: string; success: boolean; error?: string }>>
    searchFiles: (dir: string, keyword: string) => Promise<Array<{ name: string; path: string }>>
    deleteFiles: (
      paths: string[]
    ) => Promise<Array<{ path: string; success: boolean; error?: string }>>
  }
}
