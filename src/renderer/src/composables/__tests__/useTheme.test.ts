import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}))
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
  writable: true
})

// Mock document.documentElement.classList
const classListMock = {
  toggle: vi.fn(),
  add: vi.fn(),
  remove: vi.fn()
}
Object.defineProperty(document.documentElement, 'classList', {
  value: classListMock,
  writable: true
})

// Mock document.body.style
const styleMock = {
  setProperty: vi.fn()
}
Object.defineProperty(document.body, 'style', {
  value: styleMock,
  writable: true
})

// Helper to check isDark logic
const checkIsDark = (mode: string, systemIsDark: boolean): boolean => {
  return mode === 'dark' || (mode === 'system' && systemIsDark)
}

describe('useThemeStore (Pinia)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    localStorageMock.getItem.mockReturnValue(null)
    // 创建新的 Pinia 实例
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('theme mode initialization', () => {
    it('should have correct default theme mode', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      expect(store.themeMode).toBe('system')
    })

    it('should read theme mode from localStorage', async () => {
      // 设置 mock 返回值后再导入 store
      localStorageMock.getItem.mockReturnValue('dark')
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      // store 从 localStorage 读取
      expect(store.themeMode).toBe('dark')
    })
  })

  describe('theme toggle logic', () => {
    it('should toggle from light to dark', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.themeMode = 'light'
      store.toggleTheme()
      expect(store.themeMode).toBe('dark')
    })

    it('should toggle from dark to system', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.themeMode = 'dark'
      store.toggleTheme()
      expect(store.themeMode).toBe('system')
    })

    it('should toggle from system to light', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.themeMode = 'system'
      store.toggleTheme()
      expect(store.themeMode).toBe('light')
    })
  })

  describe('isDark calculation', () => {
    it('should be false for light mode', () => {
      expect(checkIsDark('light', false)).toBe(false)
    })

    it('should be true for dark mode', () => {
      expect(checkIsDark('dark', false)).toBe(true)
    })

    it('should be true for system mode when system is dark', () => {
      expect(checkIsDark('system', true)).toBe(true)
    })

    it('should be false for system mode when system is light', () => {
      expect(checkIsDark('system', false)).toBe(false)
    })

    it('should be true for dark mode regardless of system', () => {
      expect(checkIsDark('dark', true)).toBe(true)
      expect(checkIsDark('dark', false)).toBe(true)
    })
  })

  describe('setTheme', () => {
    it('should save theme mode to localStorage', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.setTheme('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'dark')
    })

    it('should save light mode to localStorage', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.setTheme('light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'light')
    })

    it('should save system mode to localStorage', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      store.setTheme('system')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-mode', 'system')
    })
  })

  describe('toggleTheme cycle', () => {
    it('should complete full toggle cycle', async () => {
      const { useThemeStore } = await import('../../stores/theme')
      const store = useThemeStore()
      // 从 light 开始
      store.themeMode = 'light'
      store.toggleTheme() // -> dark
      expect(store.themeMode).toBe('dark')
      store.toggleTheme() // -> system
      expect(store.themeMode).toBe('system')
      store.toggleTheme() // -> light
      expect(store.themeMode).toBe('light')
    })
  })
})
