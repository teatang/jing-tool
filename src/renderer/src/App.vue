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
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28"><Connection /></el-icon>
        <span>jing-tool</span>
      </div>

      <el-scrollbar>
        <el-menu :default-active="route.path" class="sidebar-menu">
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

      <div class="sidebar-footer">
        <el-button class="theme-btn" :icon="themeIcon" @click="themeStore.toggleTheme">
          {{ themeText }}
        </el-button>
      </div>
    </el-aside>

    <el-main class="main-content">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background-color: var(--el-menu-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-light);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-hover-bg-color);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.theme-btn {
  width: 100%;
}

.main-content {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow: auto;
}
</style>
