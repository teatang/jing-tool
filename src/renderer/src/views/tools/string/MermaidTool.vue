<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Warning, CircleCheck, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import mermaid from 'mermaid'

// 初始化 Mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  suppressErrorRendering: true
})

const inputText = ref(
  'graph TD\n    A[开始] --> B{判断}\n    B -->|是| C[执行]\n    B -->|否| D[结束]'
)
const svgContent = ref('')
const errorMsg = ref('')
const isRendering = ref(false)

// 解析并渲染 Mermaid 语法
const renderDiagram = async (): Promise<void> => {
  // 如果已经在渲染中，跳过这次渲染请求
  if (isRendering.value) {
    return
  }

  errorMsg.value = ''
  svgContent.value = ''

  if (!inputText.value.trim()) {
    return
  }

  isRendering.value = true

  try {
    // 验证语法 - 尝试解析
    const id = `mermaid-${Date.now()}`
    const { svg } = await mermaid.render(id, inputText.value)
    svgContent.value = svg
  } catch (error: unknown) {
    const err = error as { message?: string }
    // 提取更友好的错误信息
    const msg = err.message || 'Mermaid 语法错误'
    // 清理错误信息，去除各种前缀
    const cleanMsg = msg
      .replace(/^Syntax error in text \(.*?\):\s*/i, '')
      .replace(/^Parse error.*?:\s*/i, '')
      .replace(/^Error.*?:\s*/i, '')
      .trim()
    errorMsg.value = cleanMsg || '语法错误，请检查输入'
    ElMessage.error('Mermaid 语法错误')
  } finally {
    isRendering.value = false
  }
}

// 清空输入
const clear = (): void => {
  inputText.value = ''
  svgContent.value = ''
  errorMsg.value = ''
}

// 复制错误信息
const copyError = async (): Promise<void> => {
  if (!errorMsg.value) return
  await navigator.clipboard.writeText(errorMsg.value)
  ElMessage.success('已复制错误信息')
}

// 示例代码
const examples = [
  {
    name: '流程图',
    code: `graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]`
  },
  {
    name: '时序图',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: 你好
    Bob-->>Alice: 你好！`
  },
  {
    name: '状态图',
    code: `stateDiagram-v2
    [*] --> Active
    Active --> [*]
    Active --> Inactive
    Inactive --> Active`
  },
  {
    name: '类图',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    class Animal {
        +eat()
        +sleep()
    }`
  }
]

const loadExample = (code: string): void => {
  inputText.value = code
  renderDiagram()
}

// 防抖渲染
let renderTimer: number | null = null
const debouncedRender = (): void => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
  renderTimer = window.setTimeout(() => {
    renderDiagram()
  }, 500)
}

// 手动刷新渲染
const refreshRender = (): void => {
  renderDiagram()
}

onMounted(() => {
  renderDiagram()
})

onUnmounted(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
})
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">Mermaid 编辑器</h2>
      <p class="tool-desc">编辑 Mermaid 语法并实时预览效果</p>
    </div>

    <div class="tool-content">
      <!-- 示例快捷入口 -->
      <div class="flex items-center gap-2.5 flex-wrap mb-4">
        <span class="text-sm text-gray-500 dark:text-gray-400">示例：</span>
        <el-button
          v-for="example in examples"
          :key="example.name"
          size="small"
          @click="loadExample(example.code)"
        >
          {{ example.name }}
        </el-button>
        <el-button size="small" :icon="Refresh" @click="refreshRender">刷新</el-button>
      </div>

      <div class="flex-1 flex gap-5 min-h-0">
        <!-- 左侧编辑区 -->
        <div class="flex-1 flex flex-col min-w-0">
          <div class="flex justify-between items-center mb-2.5">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Mermaid 语法</span>
            <el-button size="small" @click="clear">清空</el-button>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            class="flex-1 font-mono text-sm"
            :rows="15"
            placeholder="在此输入 Mermaid 语法..."
            @input="debouncedRender"
          />
        </div>

        <!-- 右侧预览区 -->
        <div class="flex-[1.2] flex flex-col min-w-0">
          <div class="flex justify-between items-center mb-2.5">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">预览效果</span>
            <el-tag v-if="svgContent" type="success" size="small">
              <el-icon><CircleCheck /></el-icon>
              渲染成功
            </el-tag>
          </div>
          <div
            class="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-auto p-4 flex flex-col"
          >
            <!-- 错误提示 -->
            <el-alert v-if="errorMsg" type="error" :closable="false" class="mb-4">
              <template #title>
                <div class="flex items-center gap-2">
                  <el-icon><Warning /></el-icon>
                  <span>{{ errorMsg }}</span>
                </div>
              </template>
              <template #default>
                <el-button size="small" type="info" plain @click="copyError"> 复制错误 </el-button>
              </template>
            </el-alert>

            <!-- SVG 预览 - mermaid.render 返回的 SVG 是可信的 -->
            <div
              v-if="svgContent"
              class="mermaid-preview flex-1 flex justify-center items-start overflow-auto"
              v-html="svgContent"
            />

            <!-- 空状态 -->
            <div
              v-else-if="!errorMsg && !isRendering"
              class="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
            >
              <p>输入 Mermaid 语法后将在此显示预览</p>
            </div>

            <!-- 加载状态 -->
            <div
              v-if="isRendering"
              class="flex-1 flex items-center justify-center gap-2.5 text-sm text-gray-500 dark:text-gray-400"
            >
              <el-icon class="is-loading"><Refresh /></el-icon>
              <span>渲染中...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for mermaid editor */
.mermaid-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
