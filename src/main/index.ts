import { app, ipcMain, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './window'
import './ipc/handlers'

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
