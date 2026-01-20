<script setup lang="ts">
import { ref } from 'vue'
import { Document, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const outputText = ref('')
const errorMsg = ref('')
const formatType = ref<'format' | 'minify'>('format')

const process = () => {
  errorMsg.value = ''
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  try {
    const parsed = JSON.parse(inputText.value)
    if (formatType.value === 'format') {
      outputText.value = JSON.stringify(parsed, null, 2)
    } else {
      outputText.value = JSON.stringify(parsed)
    }
  } catch (e: unknown) {
    const error = e as Error
    errorMsg.value = error.message || 'JSON 语法错误'
    outputText.value = ''
    ElMessage.error('JSON 格式错误')
  }
}

const clear = () => {
  inputText.value = ''
  outputText.value = ''
  errorMsg.value = ''
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
      <h2 class="tool-title">JSON 格式化</h2>
      <p class="tool-desc">JSON 语法检查、格式化和压缩</p>
    </div>

    <div class="tool-content">
      <div class="tool-actions">
        <el-radio-group v-model="formatType">
          <el-radio-button label="format">
            <el-icon><Document /></el-icon>
            格式化
          </el-radio-button>
          <el-radio-button label="minify">
            压缩
          </el-radio-button>
        </el-radio-group>
        <el-button @click="clear">清空</el-button>
        <el-button type="primary" @click="process">处理</el-button>
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
        <label class="textarea-label">输入 JSON</label>
        <el-input
          v-model="inputText"
          type="textarea"
          class="editor-textarea"
          :rows="10"
          placeholder="在此输入 JSON 字符串"
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
          placeholder="格式化后的结果将显示在这里"
        />
      </div>

      <el-button v-if="outputText" type="primary" @click="copyResult">
        复制结果
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.error-box {
  margin-bottom: 10px;
}
</style>
