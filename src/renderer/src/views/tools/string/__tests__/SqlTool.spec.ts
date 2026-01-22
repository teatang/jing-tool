// SQL formatter test - matches the actual SqlTool.vue implementation
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
    'REFERENCES'
  ]

  const indent = ' '.repeat(indentSize)
  let formatted = sql

  // 1. Uppercase keywords
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, keyword)
  })

  // 2. Handle multi-word keywords (ORDER BY, GROUP BY, etc.)
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

  // 3. Normalize spacing
  formatted = formatted.replace(/\s+/g, ' ')

  // 4. Add line breaks before keywords (keywords start new lines)
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

  // 5. Handle parentheses
  formatted = formatted.replace(/\(/g, `(\n${indent}${indent}`)
  formatted = formatted.replace(/\)/g, `\n${indent})`)

  // 6. Comma handling
  formatted = formatted.replace(/,\n(?!\s*['"])/g, `,\n${indent}`)

  // 7. Build final result
  const lines = formatted.split('\n')
  const result: string[] = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    // Reduce indentation for ), END, ELSE, WHEN
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

  // Remove leading empty lines, ensure first line has no indentation
  while (result.length > 0 && result[0].trim() === '') {
    result.shift()
  }
  if (result.length > 0) {
    result[0] = result[0].trim()
  }

  return result.join('\n')
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

    it('should format FROM on new line', () => {
      const input = 'select * from users'
      const result = formatSql(input)
      // FROM should start a new line
      expect(result).toContain('\nFROM')
    })

    it('should format WHERE on new line', () => {
      const input = 'select * from users where id = 1'
      const result = formatSql(input)
      // WHERE should start a new line
      expect(result).toContain('\nWHERE')
    })

    it('should format AND on new line', () => {
      const input = 'select * from users where id = 1 and status = 0'
      const result = formatSql(input)
      // AND should start a new line
      expect(result).toContain('\nAND')
    })

    it('should format LIMIT on new line', () => {
      const input = 'select * from users limit 10'
      const result = formatSql(input)
      // LIMIT should start a new line
      expect(result).toContain('\nLIMIT')
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

    it('should format complete query with multiple clauses', () => {
      const input = 'select * from users where display = 1 and type = 2 limit 10'
      const result = formatSql(input)
      const lines = result.split('\n')
      // Should have multiple lines
      expect(lines.length).toBeGreaterThan(1)
      // First line should be SELECT
      expect(lines[0]).toContain('SELECT')
      // FROM, AND, LIMIT should start new lines
      expect(result).toContain('\nFROM')
      expect(result).toContain('\nAND')
      expect(result).toContain('\nLIMIT')
    })

    it('should format query with multiple conditions', () => {
      const input = 'select * from users where display = 1 and type = 2 limit 10'
      const result = formatSql(input)
      // Each clause should be on its own line
      expect(result).toBe('SELECT *\nFROM users\nWHERE display = 1\nAND type = 2\nLIMIT 10')
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
      // Minify preserves keyword casing from formatSql
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
      expect(result).toContain('INSERT')
      expect(result).toContain('INTO')
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
