<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { formatSql, minifySql } from '@/utils/stringTools'

// 输入和输出文本
const inputText = ref('')
const outputText = ref('')
// 格式化类型：格式化或压缩
const formatType = ref<'format' | 'minify'>('format')
// 缩进空格数
const indentSize = ref(2)

const process = (): void => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  if (formatType.value === 'format') {
    outputText.value = formatSql(inputText.value, indentSize.value)
  } else {
    outputText.value = minifySql(inputText.value)
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
      <h2 class="tool-title">SQL 格式化</h2>
      <p class="tool-desc">SQL 代码格式化和压缩</p>
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

      <el-button v-if="outputText" type="primary" @click="copyResult"> 复制结果 </el-button>
    </div>
  </div>
</template>
