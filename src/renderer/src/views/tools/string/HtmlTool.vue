<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const outputText = ref('')
const formatType = ref<'format' | 'minify'>('format')
const indentSize = ref(2)

/**
 * HTML 格式化函数
 * 支持逐级缩进，处理自闭合标签和普通标签
 */
const formatHtml = (html: string, indentSize: number = 2): string => {
  const indent = ' '.repeat(indentSize)
  let formatted = ''
  let depth = 0

  // 用于匹配标签的正则表达式
  const tagRegex = /<[^>]+>/gi
  let lastWasText = false

  let match: RegExpExecArray | null
  let lastIndex = 0

  // 先清理输入，去除多余空白
  html = html.replace(/\s+/g, ' ').trim()

  while ((match = tagRegex.exec(html)) !== null) {
    const fullMatch = match[0]
    // 提取标签名
    const tagNameMatch = fullMatch.match(/<([a-zA-Z][a-zA-Z0-9]*)/i)
    const tagName = tagNameMatch ? tagNameMatch[1] : ''

    const content = html.slice(lastIndex, match.index).trim()

    // 处理文本内容（不缩进，保持原样）
    if (content && !lastWasText) {
      formatted += content
      lastWasText = true
    } else if (content && lastWasText) {
      formatted += ' ' + content
    }

    const isClosingTag = fullMatch.startsWith('</')
    const isSelfClosing =
      fullMatch.endsWith('/>') ||
      ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase())
    const isComment = fullMatch.startsWith('<!--')

    if (isSelfClosing || isComment) {
      // 自闭合标签或注释，添加到当前层级
      formatted += '\n' + indent.repeat(depth) + fullMatch
      lastWasText = false
    } else if (isClosingTag) {
      // 闭合标签，先减少缩进层级（与对应的开放标签对齐）
      depth = Math.max(0, depth - 1)
      formatted += '\n' + indent.repeat(depth) + fullMatch
      lastWasText = false
    } else {
      // 开放标签，增加缩进层级后添加
      formatted += '\n' + indent.repeat(depth) + fullMatch
      depth++
      lastWasText = false
    }

    lastIndex = tagRegex.lastIndex
  }

  // 处理剩余内容
  const remaining = html.slice(lastIndex).trim()
  if (remaining) {
    formatted += remaining
  }

  // 清理：移除开头的换行，多个换行压缩为一个
  formatted = formatted
    .replace(/^\n+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return formatted
}

const process = (): void => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  if (formatType.value === 'format') {
    outputText.value = formatHtml(inputText.value, indentSize.value)
  } else {
    // HTML 压缩
    outputText.value = inputText.value.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
  }
}

const clear = (): void => {
  inputText.value = ''
  outputText.value = ''
}

const copyResult = async (): Promise<void> => {
  if (!outputText.value) return
  await navigator.clipboard.writeText(outputText.value)
  ElMessage.success('已复制到剪贴板')
}
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">HTML 格式化</h2>
      <p class="tool-desc">HTML 代码格式化和压缩</p>
    </div>

    <div class="tool-content">
      <div class="tool-actions">
        <el-radio-group v-model="formatType">
          <el-radio-button value="format">
            <el-icon><Plus /></el-icon>
            格式化
          </el-radio-button>
          <el-radio-button value="minify">
            <el-icon><Minus /></el-icon>
            压缩
          </el-radio-button>
        </el-radio-group>
        <el-select v-model="indentSize" style="width: 100px">
          <el-option label="2空格" :value="2" />
          <el-option label="4空格" :value="4" />
        </el-select>
        <el-button @click="clear">清空</el-button>
        <el-button type="primary" @click="process">处理</el-button>
      </div>

      <div class="textarea-container">
        <label class="textarea-label">输入 HTML</label>
        <el-input
          v-model="inputText"
          type="textarea"
          class="editor-textarea"
          :rows="10"
          placeholder="在此输入 HTML 代码"
        />
      </div>

      <div class="textarea-container">
        <label class="textarea-label">输出</label>
        <el-input
          v-model="outputText"
          type="textarea"
          class="editor-textarea"
          :rows="10"
          readonly
          placeholder="处理后的结果将显示在这里"
        />
      </div>

      <el-button v-if="outputText" type="primary" @click="copyResult"> 复制结果 </el-button>
    </div>
  </div>
</template>
