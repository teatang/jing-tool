<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const outputText = ref('')
const formatType = ref<'format' | 'minify'>('format')

const process = (): void => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  if (formatType.value === 'format') {
    // 简单的 HTML 格式化
    const formatted = inputText.value
      .replace(/></g, '>\n<')
      .replace(/>\s+</g, '>\n  <')
      .replace(/>\s+</g, '>\n  <')
    outputText.value = formatted.trim()
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
          <el-radio-button label="format">
            <el-icon><Plus /></el-icon>
            格式化
          </el-radio-button>
          <el-radio-button label="minify">
            <el-icon><Minus /></el-icon>
            压缩
          </el-radio-button>
        </el-radio-group>
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
