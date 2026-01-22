import { ipcMain } from 'electron'
import { join, dirname } from 'path'
import { promises as fs } from 'fs'

/**
 * 重命名单个文件
 */
ipcMain.handle('rename-file', async (_, filePath: string, newName: string) => {
  try {
    const baseDir = dirname(filePath)
    // 验证路径有效性
    if (!baseDir || !filePath.startsWith('/')) {
      return { success: false, error: '无效的文件路径' }
    }
    const newPath = join(baseDir, newName)
    await fs.rename(filePath, newPath)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

/**
 * 批量重命名文件
 */
ipcMain.handle('batch-rename', async (_, files: Array<{ path: string; newName: string }>) => {
  const results: Array<{ path: string; success: boolean; error?: string }> = []
  for (const file of files) {
    try {
      const baseDir = dirname(file.path)
      // 验证路径有效性
      if (!baseDir || !file.path.startsWith('/')) {
        results.push({ path: file.path, success: false, error: '无效的文件路径' })
        continue
      }
      const newPath = join(baseDir, file.newName)
      await fs.rename(file.path, newPath)
      results.push({ path: file.path, success: true })
    } catch (error) {
      results.push({ path: file.path, success: false, error: String(error) })
    }
  }
  return results
})

/**
 * 删除文件或目录
 */
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

/**
 * 读取目录内容
 */
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
