/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'

// 测试辅助函数 - 复制 search-handler 的逻辑进行单元测试
describe('search-handler logic', () => {
  const mockReaddir = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.doUnmock('fs')
    vi.doUnmock('path')

    vi.spyOn(fs, 'readdir').mockImplementation(mockReaddir)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchFiles', () => {
    const searchFiles = async (
      dir: string,
      keyword: string
    ): Promise<Array<{ name: string; path: string }>> => {
      const results: Array<{ name: string; path: string }> = []

      async function search(currentDir: string): Promise<void> {
        try {
          const entries = await fs.readdir(currentDir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = `${currentDir}/${entry.name}`
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
    }

    it('should find matching files in directory', async () => {
      const mockEntries = [
        { name: 'test-file.txt', isDirectory: () => false },
        { name: 'other.txt', isDirectory: () => false }
      ]
      mockReaddir.mockResolvedValue(mockEntries)

      const results = await searchFiles('/test', 'test')

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('test-file.txt')
      expect(results[0].path).toBe('/test/test-file.txt')
    })

    it('should search recursively in subdirectories', async () => {
      // 顶层目录 - 包含 'test' 的文件
      const topEntries = [
        { name: 'test-file.txt', isDirectory: () => false },
        { name: 'subdir', isDirectory: () => true }
      ]
      // 子目录 - 也包含 'test' 的文件
      const subEntries = [{ name: 'nested-test.txt', isDirectory: () => false }]

      mockReaddir.mockResolvedValueOnce(topEntries).mockResolvedValueOnce(subEntries)

      const results = await searchFiles('/test', 'test')

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.name)).toContain('test-file.txt')
      expect(results.map((r) => r.name)).toContain('nested-test.txt')
    })

    it('should return empty array when no matches found', async () => {
      mockReaddir.mockResolvedValue([{ name: 'other.txt', isDirectory: () => false }])

      const results = await searchFiles('/test', 'nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should handle permission errors gracefully', async () => {
      mockReaddir.mockRejectedValue(new Error('EACCES: permission denied'))

      const results = await searchFiles('/protected', 'test')

      expect(results).toHaveLength(0)
    })

    it('should find multiple matches in different directories', async () => {
      // 顶层目录
      const topEntries = [
        { name: 'test1.log', isDirectory: () => false },
        { name: 'dir1', isDirectory: () => true }
      ]
      // 子目录
      const subEntries = [{ name: 'test2.log', isDirectory: () => false }]

      mockReaddir.mockResolvedValueOnce(topEntries).mockResolvedValueOnce(subEntries)

      const results = await searchFiles('/logs', 'test')

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.name).sort()).toEqual(['test1.log', 'test2.log'])
    })
  })
})
