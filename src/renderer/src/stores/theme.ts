import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const themeMode = ref<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system')

  // 缓存系统主题偏好
  const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

  // 计算属性
  const isDark = computed(() => {
    return themeMode.value === 'dark' || (themeMode.value === 'system' && systemPrefersDark.value)
  })

  // 方法
  const setTheme = (mode: ThemeMode): void => {
    themeMode.value = mode
    localStorage.setItem('theme-mode', mode)
  }

  const toggleTheme = (): void => {
    if (themeMode.value === 'light') {
      setTheme('dark')
    } else if (themeMode.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const applyTheme = (): void => {
    const dark = isDark.value

    // 设置 HTML 的 dark class
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 监听主题模式变化，自动应用
  watch(
    themeMode,
    () => {
      applyTheme()
    },
    { immediate: true }
  )

  const initTheme = (): void => {
    // 初始化系统主题监听
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
      // 只有在 system 模式下才自动应用主题
      if (themeMode.value === 'system') {
        applyTheme()
      }
    })
  }

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
    initTheme
  }
})
