import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 预加载脚本：在渲染进程和主进程之间建立安全的通信桥梁
// 通过 contextBridge 将 API 暴露给渲染进程，同时保持进程隔离

/**
 * 文件操作相关的 API
 * 渲染进程通过 window.api 调用这些方法与主进程通信
 */
const api = {
  // 选择文件夹
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  // 读取目录内容
  readDir: (path: string) => ipcRenderer.invoke('read-dir', path),
  // 重命名文件
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('rename-file', oldPath, newPath),
  // 批量重命名
  batchRename: (files: Array<{ path: string; newName: string }>) =>
    ipcRenderer.invoke('batch-rename', files),
  // 搜索文件
  searchFiles: (dir: string, keyword: string) => ipcRenderer.invoke('search-files', dir, keyword),
  // 删除文件
  deleteFiles: (paths: string[]) => ipcRenderer.invoke('delete-files', paths)
}

// 只有在启用上下文隔离时才通过 contextBridge 暴露 API
if (process.contextIsolated) {
  try {
    // 暴露 Electron 官方 API
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 暴露自定义 API
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // 兼容性处理：禁用上下文隔离时直接挂载到全局对象
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
