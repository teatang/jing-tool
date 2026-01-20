import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename, dirname } from 'path'
import { promises as fs } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.jingtool')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
