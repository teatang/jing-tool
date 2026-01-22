import { shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

/**
 * 创建主窗口
 * 负责初始化浏览器窗口、加载页面、处理窗口事件
 */
export function createWindow(): BrowserWindow {
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

  return mainWindow
}
