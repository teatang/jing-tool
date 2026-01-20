import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const themeMode: Ref<ThemeMode> = ref('system')

export function useTheme() {
  const isDark = ref(false)

  const updateTheme = () => {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = themeMode.value === 'dark' || (themeMode.value === 'system' && isSystemDark)
    isDark.value = dark

    // 设置 html class
    document.documentElement.classList.toggle('dark', dark)

    // 设置 Element Plus CSS 变量
    if (dark) {
      document.documentElement.classList.add('dark')
      document.body.style.setProperty('--el-color-primary', '#409eff')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localStorage.setItem('theme-mode', themeMode.value)
  }

  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    updateTheme()
  }

  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      setTheme('dark')
    } else if (themeMode.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null
    if (saved) {
      themeMode.value = saved
    }
    updateTheme()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeMode.value === 'system') {
        updateTheme()
      }
    })
  })

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme
  }
}
