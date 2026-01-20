<script setup lang="ts">
import { ref } from 'vue'
import { Document, Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const outputText = ref('')
const formatType = ref<'format' | 'minify'>('format')
const indentSize = ref(2)

const process = () => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  if (formatType.value === 'format') {
    // 简单的 SQL 格式化
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES',
      'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
      'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'ORDER', 'BY',
      'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
      'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'INNER', 'CASE',
      'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC'
    ]

    let sql = inputText.value
    // 大写关键字
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      sql = sql.replace(regex, keyword)
    })

    // 添加缩进
    const indent = ' '.repeat(indentSize.value)
    const lines = sql.split('\n')
    let formatted = ''
    let depth = 0

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      if (trimmed.endsWith('BEGIN') || trimmed.endsWith('{')) {
        formatted += indent.repeat(depth) + trimmed + '\n'
        depth++
      } else if (trimmed.startsWith('END') || trimmed.startsWith('}') || trimmed === 'END') {
        depth--
        formatted += indent.repeat(depth) + trimmed + '\n'
      } else {
        formatted += indent.repeat(depth) + trimmed + '\n'
      }
    })

    outputText.value = formatted.trim()
  } else {
    // SQL 压缩
    outputText.value = inputText.value
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;()=])\s*/g, '$1')
      .trim()
  }
}

const clear = () => {
  inputText.value = ''
  outputText.value = ''
}

const copyResult = async () => {
  if (!outputText.value) return
  await navigator.clipboard.writeText(outputText.value)
  ElMessage.success('已复制到剪贴板')
}
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">SQL 格式化</h2>
      <p class="tool-desc">SQL 代码格式化和压缩</p>
    </div>

    <div class="tool-content">
      <div class="tool-actions">
        <el-radio-group v-model="formatType">
          <el-radio-button label="format">
            <el-icon><Plus /></el-icon>
            格式化
          </el-radio-button>
          <el-radio-button label="minify">
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
        <label class="textarea-label">输入 SQL</label>
        <el-input
          v-model="inputText"
          type="textarea"
          class="editor-textarea"
          :rows="10"
          placeholder="在此输入 SQL 语句"
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

      <el-button v-if="outputText" type="primary" @click="copyResult">
        复制结果
      </el-button>
    </div>
  </div>
</template>
