<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { Sunny, Moon, Monitor, Connection, Document, Folder, Grid } from '@element-plus/icons-vue'

// 使用 Pinia 主题 store
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

// 根据当前主题模式计算显示的图标
const themeIcon = computed(() => {
  switch (themeStore.themeMode) {
    case 'dark':
      return Moon
    case 'light':
      return Sunny
    default:
      return Monitor
  }
})

// 根据当前主题模式计算显示的文本
const themeText = computed(() => {
  switch (themeStore.themeMode) {
    case 'dark':
      return '深色'
    case 'light':
      return '浅色'
    default:
      return '跟随系统'
  }
})

// 字符串工具列表
const stringTools = [
  { name: 'Base64编解码', path: '/tools/string/base64' },
  { name: 'URL编解码', path: '/tools/string/url' },
  { name: 'JSON格式化', path: '/tools/string/json' },
  { name: 'HTML格式化', path: '/tools/string/html' },
  { name: 'SQL格式化', path: '/tools/string/sql' },
  { name: '正则测试', path: '/tools/string/regex' },
  { name: 'Mermaid编辑', path: '/tools/string/mermaid' }
]

// 文件工具列表
const fileTools = [
  { name: '批量重命名', path: '/tools/file/rename' },
  { name: '文件搜索', path: '/tools/file/search' }
]

// 游戏列表
const gameTools = [{ name: '俄罗斯方块', path: '/tools/game/tetris' }]

// 路由跳转方法
const navigateTo = (path: string): void => {
  router.push(path)
}

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <el-container class="h-screen w-screen">
    <el-aside
      width="220px"
      class="flex flex-col bg-menu border-r border-gray-200 dark:border-gray-700"
    >
      <div
        class="h-15 flex items-center justify-center gap-2.5 text-lg font-semibold border-b border-gray-200 dark:border-gray-700"
      >
        <el-icon :size="28"><Connection /></el-icon>
        <span>jing-tool</span>
      </div>

      <el-scrollbar class="flex-1">
        <el-menu :default-active="route.path" class="border-r-0">
          <el-sub-menu index="string">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>字符串工具</span>
            </template>
            <el-menu-item
              v-for="tool in stringTools"
              :key="tool.path"
              :index="tool.path"
              :class="{ 'is-active': route.path === tool.path }"
              @click="navigateTo(tool.path)"
            >
              {{ tool.name }}
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="file">
            <template #title>
              <el-icon><Folder /></el-icon>
              <span>文件工具</span>
            </template>
            <el-menu-item
              v-for="tool in fileTools"
              :key="tool.path"
              :index="tool.path"
              :class="{ 'is-active': route.path === tool.path }"
              @click="navigateTo(tool.path)"
            >
              {{ tool.name }}
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="game">
            <template #title>
              <el-icon><Grid /></el-icon>
              <span>休闲游戏</span>
            </template>
            <el-menu-item
              v-for="tool in gameTools"
              :key="tool.path"
              :index="tool.path"
              :class="{ 'is-active': route.path === tool.path }"
              @click="navigateTo(tool.path)"
            >
              {{ tool.name }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <el-button class="w-full" :icon="themeIcon" @click="themeStore.toggleTheme">
          {{ themeText }}
        </el-button>
      </div>
    </el-aside>

    <el-main class="p-5 bg-page overflow-auto">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-hover-bg-color);
}
</style>
