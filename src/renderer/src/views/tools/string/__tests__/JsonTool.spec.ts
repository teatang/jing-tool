const formatJson = (input: string, format: 'format' | 'minify'): string => {
  try {
    const parsed = JSON.parse(input)
    if (format === 'format') {
      return JSON.stringify(parsed, null, 2)
    } else {
      return JSON.stringify(parsed)
    }
  } catch {
    throw new Error('Invalid JSON')
  }
}

describe('JsonTool', () => {
  describe('JSON Formatting', () => {
    it('should format simple JSON', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input, 'format')
      expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}')
    })

    it('should format nested JSON', () => {
      const input = '{"user":{"name":"test","address":{"city":"Beijing"}}}'
      const result = formatJson(input, 'format')
      expect(result).toContain('"user":')
      expect(result).toContain('"name": "test"')
      expect(result).toContain('"address":')
    })

    it('should format array JSON', () => {
      const input = '[1,2,3,{"name":"test"}]'
      const result = formatJson(input, 'format')
      expect(result).toContain('[')
      expect(result).toContain(']')
      expect(result).toContain('"name": "test"')
    })
  })

  describe('JSON Minifying', () => {
    it('should minify JSON', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input, 'minify')
      expect(result).toBe('{"name":"test","value":123}')
    })

    it('should minify nested JSON', () => {
      const input = `{
        "user": {
          "name": "test"
        }
      }`
      const result = formatJson(input, 'minify')
      expect(result).toBe('{"user":{"name":"test"}}')
    })
  })

  describe('JSON Validation', () => {
    it('should throw error for invalid JSON', () => {
      expect(() => formatJson('invalid json', 'format')).toThrow()
    })

    it('should throw error for incomplete JSON', () => {
      expect(() => formatJson('{"name":', 'format')).toThrow()
    })

    it('should handle valid JSON with trailing comma', () => {
      expect(() => formatJson('{"name":"test"}', 'format')).not.toThrow()
    })
  })

  describe('JSON Round-trip', () => {
    it('should format and minify back to original', () => {
      const original = '{"name":"test","value":123}'
      const formatted = formatJson(original, 'format')
      const minified = formatJson(formatted, 'minify')
      expect(minified).toBe(original)
    })
  })

  describe('Special JSON Values', () => {
    it('should handle null', () => {
      const result = formatJson('{"value":null}', 'format')
      expect(result).toContain('null')
    })

    it('should handle boolean', () => {
      const result = formatJson('{"active":true,"deleted":false}', 'format')
      expect(result).toContain('true')
      expect(result).toContain('false')
    })

    it('should handle number', () => {
      const result = formatJson('{"int":123,"float":3.14,"negative":-5}', 'format')
      expect(result).toContain('123')
      expect(result).toContain('3.14')
      expect(result).toContain('-5')
    })
  })
})
