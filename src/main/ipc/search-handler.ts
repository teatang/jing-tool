import { ipcMain } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

/**
 * 搜索文件
 */
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
