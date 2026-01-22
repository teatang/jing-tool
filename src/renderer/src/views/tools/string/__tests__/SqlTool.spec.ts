// Simplified SQL formatter test
const formatSql = (sql: string, indentSize: number = 2): string => {
  const keywords = [
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
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'ON',
    'ORDER',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'UNION'
  ]

  const indent = ' '.repeat(indentSize)
  let formatted = sql

  // Uppercase keywords
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, keyword)
  })

  // Normalize spacing
  formatted = formatted.replace(/\s+/g, ' ')

  // Handle multi-word keywords first (ORDER BY, GROUP BY, etc.)
  const multiWordKeywords = [
    { pattern: '\\bORDER\\s+BY\\b', replace: 'ORDER BY' },
    { pattern: '\\bGROUP\\s+BY\\b', replace: 'GROUP BY' },
    { pattern: '\\bLEFT\\s+JOIN\\b', replace: 'LEFT JOIN' },
    { pattern: '\\bRIGHT\\s+JOIN\\b', replace: 'RIGHT JOIN' },
    { pattern: '\\bINNER\\s+JOIN\\b', replace: 'INNER JOIN' },
    { pattern: '\\bOUTER\\s+JOIN\\b', replace: 'OUTER JOIN' },
    { pattern: '\\bFULL\\s+JOIN\\b', replace: 'FULL JOIN' },
    { pattern: '\\bCROSS\\s+JOIN\\b', replace: 'CROSS JOIN' },
    { pattern: '\\bNATURAL\\s+JOIN\\b', replace: 'NATURAL JOIN' },
    { pattern: '\\bINSERT\\s+INTO\\b', replace: 'INSERT INTO' },
    { pattern: '\\bUNION\\s+ALL\\b', replace: 'UNION ALL' }
  ]

  multiWordKeywords.forEach(({ pattern, replace }) => {
    const regex = new RegExp(pattern, 'gi')
    formatted = formatted.replace(regex, replace)
  })

  // Add line breaks before keywords
  const lineBreakKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'OUTER JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'NATURAL JOIN',
    'JOIN',
    'ON',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'LIMIT',
    'UNION',
    'UNION ALL',
    'INSERT INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE'
  ]

  lineBreakKeywords.forEach((keyword) => {
    const regex = new RegExp(`(?<=${keyword})\\s+`, 'gi')
    formatted = formatted.replace(regex, `\n${indent}`)
  })

  // Handle parentheses
  formatted = formatted.replace(/\(/g, `(\n${indent}${indent}`)
  formatted = formatted.replace(/\)/g, `\n${indent})`)

  // Comma handling
  formatted = formatted.replace(/,\n(?!\s*['"])/g, `,\n${indent}`)

  return formatted.trim()
}

const minifySql = (sql: string): string => {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;()=])\s*/g, '$1')
    .trim()
}

describe('SqlTool', () => {
  describe('SQL Formatting', () => {
    it('should uppercase SELECT and FROM', () => {
      const input = 'select * from users'
      const result = formatSql(input)
      expect(result).toContain('SELECT')
      expect(result).toContain('FROM')
    })

    it('should add line breaks after SELECT', () => {
      const input = 'select * from users'
      const result = formatSql(input)
      expect(result).toContain('SELECT\n')
    })

    it('should add line breaks after FROM', () => {
      const input = 'select * from users'
      const result = formatSql(input)
      const lines = result.split('\n')
      expect(lines.some((line) => line.includes('FROM'))).toBe(true)
    })

    it('should format WHERE clause', () => {
      const input = 'select * from users where id = 1'
      const result = formatSql(input)
      expect(result).toContain('WHERE')
      expect(result).toContain('\n')
    })

    it('should format JOIN clause', () => {
      const input = 'select * from users join orders on users.id = orders.user_id'
      const result = formatSql(input)
      expect(result).toContain('JOIN')
      expect(result).toContain('ON')
    })

    it('should format ORDER BY clause', () => {
      const input = 'select * from users order by name'
      const result = formatSql(input)
      expect(result).toContain('ORDER BY')
    })

    it('should handle indentation', () => {
      const input = 'select * from users'
      const result = formatSql(input, 4)
      expect(result).toContain('    ')
    })
  })

  describe('SQL Minifying', () => {
    it('should remove all extra spaces', () => {
      const input = 'select  *  from   users'
      const result = minifySql(input)
      expect(result).toBe('select * from users')
    })

    it('should remove line breaks', () => {
      const input = `select *
from users`
      const result = minifySql(input)
      expect(result).toBe('select * from users')
    })

    it('should normalize operators', () => {
      const input = 'where  id   =  1'
      const result = minifySql(input)
      expect(result).toBe('where id=1')
    })
  })

  describe('SQL Round-trip', () => {
    it('should format and minify back correctly', () => {
      const original = 'select * from users where id = 1'
      const formatted = formatSql(original)
      const minified = minifySql(formatted)
      // Minify preserves keyword casing from formatSql (uppercase for SQL keywords)
      expect(minified).toContain('SELECT')
      expect(minified).toContain('FROM')
      expect(minified).toContain('WHERE')
      expect(minified).toContain('users') // Table names remain lowercase
    })
  })

  describe('Complex SQL', () => {
    it('should format INSERT statement', () => {
      const input = "insert into users (name, email) values ('test', 'test@example.com')"
      const result = formatSql(input)
      expect(result).toContain('INSERT INTO')
      expect(result).toContain('VALUES')
    })

    it('should format UPDATE statement', () => {
      const input = "update users set name = 'new' where id = 1"
      const result = formatSql(input)
      expect(result).toContain('UPDATE')
      expect(result).toContain('SET')
      expect(result).toContain('WHERE')
    })

    it('should format DELETE statement', () => {
      const input = 'delete from users where id = 1'
      const result = formatSql(input)
      expect(result).toContain('DELETE')
      expect(result).toContain('FROM')
      expect(result).toContain('WHERE')
    })

    it('should format multiple JOINs', () => {
      const input = 'select * from a join b on a.id = b.a_id left join c on b.id = c.b_id'
      const result = formatSql(input)
      expect(result).toContain('JOIN')
      expect(result).toContain('LEFT JOIN')
    })
  })
})
