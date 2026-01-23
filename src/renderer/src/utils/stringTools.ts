// ==================== Base64 ====================

/**
 * Base64 编码/解码（支持 Unicode）
 */
export const processBase64 = (input: string, mode: 'encode' | 'decode'): string => {
  if (mode === 'encode') {
    return btoa(unescape(encodeURIComponent(input)))
  } else {
    return decodeURIComponent(escape(atob(input)))
  }
}

// ==================== URL ====================

/**
 * URL 编码/解码
 */
export const processUrl = (input: string, mode: 'encode' | 'decode'): string => {
  if (mode === 'encode') {
    return encodeURIComponent(input)
  } else {
    return decodeURIComponent(input)
  }
}

// ==================== JSON ====================

export interface FormatJsonResult {
  result: string
  error?: string
}

/**
 * JSON 格式化/压缩
 */
export const formatJson = (input: string, type: 'format' | 'minify'): FormatJsonResult => {
  try {
    const parsed = JSON.parse(input)
    const result = type === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed)
    return { result }
  } catch (e: unknown) {
    return { result: '', error: (e as Error).message || 'JSON 语法错误' }
  }
}

// ==================== HTML ====================

/**
 * HTML 格式化
 * 支持逐级缩进，处理自闭合标签和普通标签
 */
export const formatHtml = (html: string, indentSize: number = 2): string => {
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

/**
 * HTML 压缩
 */
export const minifyHtml = (html: string): string => {
  return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
}

// ==================== SQL ====================

export const SQL_KEYWORDS = [
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
  'FETCH',
  'FIRST',
  'NEXT',
  'ONLY',
  'LOCK',
  'TABLE'
]

export const SQL_MULTI_WORD_KEYWORDS = [
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

export const SQL_LINE_START_KEYWORDS = [
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

/**
 * SQL 格式化
 */
export const formatSql = (sql: string, indentSize: number = 2): string => {
  const indent = ' '.repeat(indentSize)

  // 1. 大写关键字
  let formatted = sql
  SQL_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, keyword)
  })

  // 2. 处理多词关键字
  SQL_MULTI_WORD_KEYWORDS.forEach((keyword) => {
    const words = keyword.split(' ')
    if (words.length === 2) {
      const regex = new RegExp(`\\b${words[0]}\\s+${words[1]}\\b`, 'gi')
      formatted = formatted.replace(regex, `${words[0]} ${words[1]}`)
    }
  })

  // 3. 规范化所有空格为单个空格
  formatted = formatted.replace(/\s+/g, ' ')

  // 4. 在关键字前添加换行
  SQL_LINE_START_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, `\n${indent}${keyword}`)
  })

  // 5. 处理括号内的内容缩进
  formatted = formatted.replace(/\(/g, `(\n${indent}${indent}`)
  formatted = formatted.replace(/\)/g, `\n${indent})`)

  // 6. 处理逗号
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

/**
 * SQL 压缩
 */
export const minifySql = (sql: string): string => {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;()=])\s*/g, '$1')
    .trim()
}

// ==================== Regex ====================

export interface TestRegexResult {
  matches: RegExpExecArray[]
  error?: string
}

/**
 * 正则测试执行
 */
export const testRegex = (
  pattern: string,
  testString: string,
  flags: string[]
): TestRegexResult => {
  try {
    const regex = new RegExp(pattern, flags.join(''))
    const results: RegExpExecArray[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(testString)) !== null) {
      results.push(match)
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }
    return { matches: results }
  } catch (e: unknown) {
    return { matches: [], error: (e as Error).message }
  }
}

/**
 * HTML 转义
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
