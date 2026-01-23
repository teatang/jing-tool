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
      <div class="examples-bar">
        <span class="examples-label">示例：</span>
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

      <div class="editor-container">
        <!-- 左侧编辑区 -->
        <div class="editor-section">
          <div class="section-header">
            <span class="section-title">Mermaid 语法</span>
            <el-button size="small" @click="clear">清空</el-button>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            class="mermaid-editor"
            :rows="15"
            placeholder="在此输入 Mermaid 语法..."
            @input="debouncedRender"
          />
        </div>

        <!-- 右侧预览区 -->
        <div class="preview-section">
          <div class="section-header">
            <span class="section-title">预览效果</span>
            <el-tag v-if="svgContent" type="success" size="small">
              <el-icon><CircleCheck /></el-icon>
              渲染成功
            </el-tag>
          </div>
          <div class="preview-container">
            <!-- 错误提示 -->
            <el-alert v-if="errorMsg" type="error" :closable="false" class="error-alert">
              <template #title>
                <div class="error-content">
                  <el-icon><Warning /></el-icon>
                  <span>{{ errorMsg }}</span>
                </div>
              </template>
              <template #default>
                <el-button size="small" type="info" plain @click="copyError"> 复制错误 </el-button>
              </template>
            </el-alert>

            <!-- SVG 预览 -->
            <div v-if="svgContent" class="mermaid-preview" v-html="svgContent" />

            <!-- 空状态 -->
            <div v-else-if="!errorMsg && !isRendering" class="empty-state">
              <p>输入 Mermaid 语法后将在此显示预览</p>
            </div>

            <!-- 加载状态 -->
            <div v-if="isRendering" class="loading-state">
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
.tool-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-header {
  margin-bottom: 20px;
}

.tool-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.tool-desc {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.tool-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.examples-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.examples-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.editor-container {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.editor-section,
.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.mermaid-editor {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.mermaid-editor :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
}

.preview-section {
  flex: 1.2;
}

.preview-container {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.error-alert {
  margin-bottom: 16px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mermaid-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}

.mermaid-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.loading-state .el-icon {
  font-size: 20px;
}
</style>
