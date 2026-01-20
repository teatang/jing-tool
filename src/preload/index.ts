import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 文件相关 API
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readDir: (path: string) => ipcRenderer.invoke('read-dir', path),
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('rename-file', oldPath, newPath),
  batchRename: (files: Array<{ path: string; newName: string }>) =>
    ipcRenderer.invoke('batch-rename', files),
  searchFiles: (dir: string, keyword: string) =>
    ipcRenderer.invoke('search-files', dir, keyword),
  deleteFiles: (paths: string[]) => ipcRenderer.invoke('delete-files', paths)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
