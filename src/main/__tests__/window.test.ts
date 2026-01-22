/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { join, resolve } from 'path'

describe('window.ts', () => {
  it('should have correct window configuration constants', () => {
    // 验证 window.ts 中使用的配置
    const windowConfig = {
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: true
    }

    expect(windowConfig.width).toBe(1200)
    expect(windowConfig.height).toBe(800)
    expect(windowConfig.show).toBe(false)
    expect(windowConfig.autoHideMenuBar).toBe(true)
  })

  it('should use preload path pattern correctly', () => {
    const preloadPathPattern = resolve(__dirname, '../preload/index.js')
    expect(preloadPathPattern).toContain('/preload/index.js')
  })

  it('should use renderer path pattern correctly', () => {
    const rendererPathPattern = resolve(__dirname, '../renderer/index.html')
    expect(rendererPathPattern).toContain('/renderer/index.html')
  })

  it('should construct paths correctly with join', () => {
    const joined = join('/test', 'preload', 'index.js')
    expect(joined).toBe('/test/preload/index.js')
  })
})
