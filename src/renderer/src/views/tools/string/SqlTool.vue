<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 输入和输出文本
const inputText = ref('')
const outputText = ref('')
// 格式化类型：格式化或压缩
const formatType = ref<'format' | 'minify'>('format')
// 缩进空格数
const indentSize = ref(2)

// SQL关键字列表（用于转大写）
const uppercaseKeywords = [
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'TABLE',
  'ALTER',
  'DROP',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'OUTER',
  'FULL',
  'CROSS',
  'NATURAL',
  'ON',
  'ORDER',
  'GROUP',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'ALL',
  'DISTINCT',
  'DISTINCTROW',
  'AS',
  'IN',
  'NOT',
  'NULL',
  'IS',
  'LIKE',
  'BETWEEN',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'ASC',
  'DESC',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'CONSTRAINT',
  'INDEX',
  'UNIQUE',
  'CHECK',
  'DEFAULT',
  'CASCADE',
  'RESTRICT',
  'NO',
  'ACTION',
  'EXISTS',
  'CAST',
  'COLLATE',
  'CONVERT',
  'TRUNCATE',
  'TEMPORARY',
  'IF',
  'FOR',
  'VIEW',
  'MATERIALIZED',
  'WITH',
  'RECURSIVE',
  'OVER',
  'PARTITION',
  'ROWS',
  'RANGE',
  'PRECEDING',
  'FOLLOWING',
  'CURRENT',
  'ROW',
  'ROWS',
  'FETCH',
  'FIRST',
  'NEXT',
  'ONLY',
  'LOCK',
  'TABLE'
]

/**
 * SQL 格式化函数
 * 格式化规则：
 * - SELECT 后跟字段在同一行
 * - FROM 单独一行
 * - WHERE 后跟第一个条件在同一行
 * - AND/OR 单独一行
 * - LIMIT 单独一行
 */
const formatSql = (sql: string): string => {
  const indent = ' '.repeat(indentSize.value)

  // 1. 大写关键字
  let formatted = sql
  uppercaseKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, keyword)
  })

  // 2. 处理多词关键字（ORDER BY, GROUP BY 等）
  const multiWordKeywords = [
    'ORDER BY',
    'GROUP BY',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'OUTER JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'NATURAL JOIN',
    'UNION ALL',
    'FETCH FIRST',
    'FOR UPDATE',
    'FOR SHARE'
  ]
  multiWordKeywords.forEach((keyword) => {
    const words = keyword.split(' ')
    if (words.length === 2) {
      const regex = new RegExp(`\\b${words[0]}\\s+${words[1]}\\b`, 'gi')
      formatted = formatted.replace(regex, `${words[0]} ${words[1]}`)
    }
  })

  // 3. 规范化所有空格为单个空格
  formatted = formatted.replace(/\s+/g, ' ')

  // 4. 在 FROM, WHERE, LIMIT, AND, OR 等关键字前添加换行
  // 这些关键字应该作为新行的开始
  const lineStartKeywords = [
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'LIMIT',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'OFFSET',
    'UNION',
    'EXCEPT',
    'INTERSECT',
    'VALUES',
    'SET'
  ]
  lineStartKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, `\n${indent}${keyword}`)
  })

  // 5. 处理括号内的内容缩进
  formatted = formatted.replace(/\(/g, `(\n${indent}${indent}`)
  formatted = formatted.replace(/\)/g, `\n${indent})`)

  // 6. 处理逗号（SELECT列表中的逗号后不换行，参数列表中的逗号后换行）
  formatted = formatted.replace(/,\n(?!\s*['"])/g, `,\n${indent}`)

  // 7. 构建最终结果
  const lines = formatted.split('\n')
  const result: string[] = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    // 减少缩进的情况：), END, ELSE, WHEN
    if (
      trimmed.startsWith(')') ||
      trimmed.startsWith('END') ||
      trimmed.startsWith('ELSE') ||
      trimmed.startsWith('WHEN')
    ) {
      result.push(indent.repeat(0) + trimmed)
    } else {
      result.push(trimmed)
    }
  })

  // 移除开头的空行，确保第一行没有缩进
  while (result.length > 0 && result[0].trim() === '') {
    result.shift()
  }
  if (result.length > 0) {
    result[0] = result[0].trim()
  }

  return result.join('\n')
}

const process = (): void => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  if (formatType.value === 'format') {
    outputText.value = formatSql(inputText.value)
  } else {
    // SQL 压缩
    outputText.value = inputText.value
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;()=])\s*/g, '$1')
      .trim()
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
