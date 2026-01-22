<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const regexPattern = ref('')
const testString = ref('')
const flags = ref<string[]>(['g'])
const matches = ref<string[]>([])
const errorMsg = ref('')

const flagsOptions = [
  { label: 'g (全局)', value: 'g' },
  { label: 'i (忽略大小写)', value: 'i' },
  { label: 'm (多行)', value: 'm' },
  { label: 's (dotAll)', value: 's' }
]

const matchesText = computed(() => {
  return matches.value.join('\n')
})

const testRegex = (): void => {
  errorMsg.value = ''
  matches.value = []

  if (!regexPattern.value) {
    errorMsg.value = '请输入正则表达式'
    return
  }

  try {
    // flags 是数组，需要合并为字符串
    const flagsString = flags.value.join('')
    const regex = new RegExp(regexPattern.value, flagsString)
    const results = testString.value.match(regex)
    matches.value = results || []
  } catch (e: unknown) {
    const error = e as Error
    errorMsg.value = error.message || '正则表达式错误'
    ElMessage.error('正则表达式格式错误')
  }
}

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
        <el-button type="primary" @click="testRegex">
          <el-icon><Search /></el-icon>
          测试
        </el-button>
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
          class="editor-textarea"
          :rows="6"
          placeholder="在此输入测试文本"
        />
      </div>

      <div class="match-result">
        <div class="match-header">
          <span>匹配结果：{{ matchCount() }} 个匹配</span>
        </div>
        <el-input
          v-model="matchesText"
          type="textarea"
          readonly
          :rows="6"
          placeholder="匹配结果将显示在这里"
        />
      </div>

      <div v-if="matches.length > 0" class="matches-list">
        <el-tag v-for="(match, index) in matches" :key="index" type="success" size="large">
          {{ index + 1 }}. {{ match }}
        </el-tag>
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

.matches-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
