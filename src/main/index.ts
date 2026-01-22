import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { promises as fs } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

/**
 * 创建主窗口
 * 负责初始化浏览器窗口、加载页面、处理窗口事件
 */
function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 窗口准备好显示时显示窗口
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 处理在新窗口中打开链接的请求
  mainWindow.webContents.setWindowOpenHandler((details) => {
    // 使用系统默认浏览器打开外部链接
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发模式下使用热更新，生产模式加载本地文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 文件相关 IPC 处理
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('read-dir', async (_, dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: join(dirPath, entry.name)
    }))
  } catch {
    return []
  }
})

ipcMain.handle('rename-file', async (_, oldPath: string, newPath: string) => {
  try {
    await fs.rename(oldPath, newPath)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('batch-rename', async (_, files: Array<{ path: string; newName: string }>) => {
  const results: Array<{ path: string; success: boolean; error?: string }> = []
  for (const file of files) {
    try {
      const newPath = join(dirname(file.path), file.newName)
      await fs.rename(file.path, newPath)
      results.push({ path: file.path, success: true })
    } catch (error) {
      results.push({ path: file.path, success: false, error: String(error) })
    }
  }
  return results
})

ipcMain.handle('search-files', async (_, dir: string, keyword: string) => {
  const results: Array<{ name: string; path: string }> = []

  async function search(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name)
        if (entry.name.includes(keyword)) {
          results.push({ name: entry.name, path: fullPath })
        }
        if (entry.isDirectory()) {
          await search(fullPath)
        }
      }
    } catch {
      // 忽略权限错误
    }
  }

  await search(dir)
  return results
})

ipcMain.handle('delete-files', async (_, paths: string[]) => {
  const results: Array<{ path: string; success: boolean; error?: string }> = []
  for (const path of paths) {
    try {
      const stat = await fs.stat(path)
      if (stat.isDirectory()) {
        await fs.rm(path, { recursive: true, force: true })
      } else {
        await fs.unlink(path)
      }
      results.push({ path, success: true })
    } catch (error) {
      results.push({ path, success: false, error: String(error) })
    }
  }
  return results
})

// 当 Electron 完成初始化并准备好创建浏览器窗口时调用
app.whenReady().then(() => {
  // 设置 Windows 上的应用用户模型 ID
  electronApp.setAppUserModelId('com.jingtool')

  // 开发环境下按 F12 打开/关闭开发者工具
  // 生产环境下忽略 Ctrl+R / Cmd+R 刷新快捷键
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 测试 IPC 通信
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // macOS 上点击 dock 图标且没有窗口打开时重新创建窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，所有窗口关闭时退出应用
// macOS 上通常保留菜单栏直到用户主动退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
