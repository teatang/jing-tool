<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const regexPattern = ref('')
const testString = ref('')
const flags = ref<string[]>(['g'])
const matches = ref<RegExpExecArray[]>([])
const errorMsg = ref('')

const flagsOptions = [
  { label: 'g (全局)', value: 'g' },
  { label: 'i (忽略大小写)', value: 'i' },
  { label: 'm (多行)', value: 'm' },
  { label: 's (dotAll)', value: 's' }
]

/**
 * 高亮显示匹配结果
 * 将匹配到的文本用 <mark> 标签包裹，交替使用两种颜色
 */
const highlightedText = computed(() => {
  if (!regexPattern.value || matches.value.length === 0) {
    return escapeHtml(testString.value)
  }

  let result = ''
  let lastIndex = 0

  // 按匹配位置排序
  const sortedMatches = [...matches.value].sort((a, b) => a.index - b.index)

  for (let i = 0; i < sortedMatches.length; i++) {
    const match = sortedMatches[i]
    // 交替使用两种颜色类名
    const highlightClass = i % 2 === 0 ? 'match-highlight-1' : 'match-highlight-2'

    // 添加匹配之前的文本
    result += escapeHtml(testString.value.slice(lastIndex, match.index))
    // 添加高亮的匹配文本
    result += `<mark class="${highlightClass}">${escapeHtml(match[0])}</mark>`
    lastIndex = match.index + match[0].length
  }

  // 添加最后的文本
  result += escapeHtml(testString.value.slice(lastIndex))

  return result
})

/**
 * 转义 HTML 特殊字符
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * 执行正则匹配
 */
const runRegex = (): void => {
  errorMsg.value = ''

  // 如果没有正则表达式，显示提示
  if (!regexPattern.value) {
    errorMsg.value = '请输入正则表达式'
    matches.value = []
    return
  }

  try {
    // flags 是数组，需要合并为字符串
    const flagsString = flags.value.join('')
    const regex = new RegExp(regexPattern.value, flagsString)

    // 收集所有匹配结果（包括位置信息）
    const results: RegExpExecArray[] = []
    let match: RegExpExecArray | null

    // 使用 lastIndex 来遍历所有匹配
    while ((match = regex.exec(testString.value)) !== null) {
      results.push(match)
      // 避免无限循环（对于零宽度匹配）
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }

    // 使用新数组替换，确保响应式更新
    matches.value = [...results]
  } catch (e: unknown) {
    const error = e as Error
    errorMsg.value = error.message || '正则表达式错误'
    matches.value = []
  }
}

// 监听正则表达式、测试文本和标志的变化，自动执行匹配
watch(
  [regexPattern, testString, flags],
  () => {
    runRegex()
  },
  { deep: true }
)

const clear = (): void => {
  regexPattern.value = ''
  testString.value = ''
  matches.value = []
  errorMsg.value = ''
}

const matchCount = (): number => {
  return matches.value.length
}
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">正则测试</h2>
      <p class="tool-desc">测试正则表达式匹配效果</p>
    </div>

    <div class="tool-content">
      <div class="regex-config">
        <el-input v-model="regexPattern" placeholder="输入正则表达式，如: \w+" style="flex: 2">
          <template #prepend>正则</template>
        </el-input>
        <el-select v-model="flags" multiple placeholder="标志" style="width: 200px">
          <el-option
            v-for="item in flagsOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button @click="clear">清空</el-button>
      </div>

      <div v-if="errorMsg" class="error-box">
        <el-alert type="error" :closable="false">
          <template #title>
            <el-icon><Warning /></el-icon>
            {{ errorMsg }}
          </template>
        </el-alert>
      </div>

      <div class="textarea-container">
        <label class="textarea-label">测试文本</label>
        <el-input
          v-model="testString"
          type="textarea"
          :rows="6"
          placeholder="在此输入测试文本"
          class="test-input"
        />
        <div v-if="matches.length > 0" class="highlight-preview">
          <div class="highlight-label">高亮预览</div>
          <div class="highlight-content" v-html="highlightedText"></div>
        </div>
      </div>

      <div class="match-result">
        <div class="match-header">
          <span>匹配结果：{{ matchCount() }} 个匹配</span>
        </div>
        <div class="matches-textarea">
          <div v-for="(match, index) in matches" :key="index" class="match-line">
            <span class="match-line-number">{{ index + 1 }}.</span>
            <span class="match-line-content">{{ match[0] }}</span>
          </div>
          <div v-if="matches.length === 0" class="match-empty">匹配结果将显示在这里</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.regex-config {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.error-box {
  margin-bottom: 10px;
}

.match-result {
  margin-top: 10px;
}

.match-header {
  margin-bottom: 8px;
  font-weight: 500;
}

.matches-textarea {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-fill-color-blank);
  min-height: 144px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.match-line {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.match-line:last-child {
  border-bottom: none;
}

.match-line-number {
  color: var(--el-text-color-secondary);
  min-width: 36px;
  margin-right: 8px;
  flex-shrink: 0;
}

.match-line-content {
  word-break: break-all;
}

.match-empty {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.test-input {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.highlight-preview {
  margin-top: 12px;
}

.highlight-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.highlight-content {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-fill-color-blank);
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 60px;
}

/* 交替高亮颜色 - 颜色1（黄色系） */
:deep(.match-highlight-1) {
  background-color: rgba(255, 193, 7, 0.7);
  color: #000;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 500;
}

/* 交替高亮颜色 - 颜色2（蓝色系） */
:deep(.match-highlight-2) {
  background-color: rgba(33, 150, 243, 0.6);
  color: #000;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 500;
}

/* 夜间模式 - 颜色1 */
html.dark :deep(.match-highlight-1) {
  background-color: rgba(255, 167, 38, 0.85);
  color: #fff;
}

/* 夜间模式 - 颜色2 */
html.dark :deep(.match-highlight-2) {
  background-color: rgba(30, 136, 229, 0.8);
  color: #fff;
}
</style>
