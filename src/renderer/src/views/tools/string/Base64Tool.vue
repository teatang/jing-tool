<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Unlock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const outputText = ref('')
const mode = ref<'encode' | 'decode'>('encode')

const process = (): void => {
  try {
    if (mode.value === 'encode') {
      outputText.value = btoa(inputText.value)
    } else {
      outputText.value = atob(inputText.value)
    }
  } catch {
    ElMessage.error('解码失败：输入内容不是有效的Base64编码')
    outputText.value = ''
  }
}

const swapMode = (): void => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
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
      <h2 class="tool-title">Base64 编解码</h2>
      <p class="tool-desc">将文本进行 Base64 编码或解码</p>
    </div>

    <div class="tool-content">
      <div class="tool-actions">
        <el-radio-group v-model="mode">
          <el-radio-button label="encode">
            <el-icon><Lock /></el-icon>
            编码
          </el-radio-button>
          <el-radio-button label="decode">
            <el-icon><Unlock /></el-icon>
            解码
          </el-radio-button>
        </el-radio-group>
        <el-button @click="swapMode">交换</el-button>
        <el-button @click="clear">清空</el-button>
        <el-button type="primary" @click="process">转换</el-button>
      </div>

      <div class="textarea-container">
        <label class="textarea-label">输入</label>
        <el-input
          v-model="inputText"
          type="textarea"
          class="editor-textarea"
          :rows="10"
          placeholder="在此输入要转换的文本"
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
          placeholder="转换结果将显示在这里"
        />
      </div>

      <el-button v-if="outputText" type="primary" @click="copyResult"> 复制结果 </el-button>
    </div>
  </div>
</template>
