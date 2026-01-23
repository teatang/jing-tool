import { describe, it, expect } from 'vitest'
import { formatSql, minifySql } from '@/utils/stringTools'

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
