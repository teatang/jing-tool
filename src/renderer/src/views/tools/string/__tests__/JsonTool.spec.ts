import { describe, it, expect } from 'vitest'
import { formatJson } from '@/utils/stringTools'

describe('JsonTool', () => {
  describe('JSON Formatting', () => {
    it('should format simple JSON', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input, 'format')
      expect(result.result).toBe('{\n  "name": "test",\n  "value": 123\n}')
    })

    it('should format nested JSON', () => {
      const input = '{"user":{"name":"test","address":{"city":"Beijing"}}}'
      const result = formatJson(input, 'format')
      expect(result.result).toContain('"user":')
      expect(result.result).toContain('"name": "test"')
      expect(result.result).toContain('"address":')
    })

    it('should format array JSON', () => {
      const input = '[1,2,3,{"name":"test"}]'
      const result = formatJson(input, 'format')
      expect(result.result).toContain('[')
      expect(result.result).toContain(']')
      expect(result.result).toContain('"name": "test"')
    })
  })

  describe('JSON Minifying', () => {
    it('should minify JSON', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input, 'minify')
      expect(result.result).toBe('{"name":"test","value":123}')
    })

    it('should minify nested JSON', () => {
      const input = `{
        "user": {
          "name": "test"
        }
      }`
      const result = formatJson(input, 'minify')
      expect(result.result).toBe('{"user":{"name":"test"}}')
    })
  })

  describe('JSON Validation', () => {
    it('should throw error for invalid JSON', () => {
      const result = formatJson('invalid json', 'format')
      expect(result.error).toBeDefined()
    })

    it('should throw error for incomplete JSON', () => {
      const result = formatJson('{"name":', 'format')
      expect(result.error).toBeDefined()
    })

    it('should handle valid JSON with trailing comma', () => {
      const result = formatJson('{"name":"test"}', 'format')
      expect(result.error).toBeUndefined()
    })
  })

  describe('JSON Round-trip', () => {
    it('should format and minify back to original', () => {
      const original = '{"name":"test","value":123}'
      const formatted = formatJson(original, 'format')
      const minified = formatJson(formatted.result, 'minify')
      expect(minified.result).toBe(original)
    })
  })

  describe('Special JSON Values', () => {
    it('should handle null', () => {
      const result = formatJson('{"value":null}', 'format')
      expect(result.result).toContain('null')
    })

    it('should handle boolean', () => {
      const result = formatJson('{"active":true,"deleted":false}', 'format')
      expect(result.result).toContain('true')
      expect(result.result).toContain('false')
    })

    it('should handle number', () => {
      const result = formatJson('{"int":123,"float":3.14,"negative":-5}', 'format')
      expect(result.result).toContain('123')
      expect(result.result).toContain('3.14')
      expect(result.result).toContain('-5')
    })
  })
})
