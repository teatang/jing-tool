import { describe, it, expect } from 'vitest'
import { processBase64 } from '@/utils/stringTools'

describe('Base64Tool', () => {
  describe('Base64 Encoding', () => {
    it('should encode simple text', () => {
      expect(processBase64('hello', 'encode')).toBe('aGVsbG8=')
    })

    it('should encode Chinese characters', () => {
      expect(processBase64('你好', 'encode')).toBe('5L2g5aW9')
    })

    it('should encode empty string', () => {
      expect(processBase64('', 'encode')).toBe('')
    })

    it('should encode special characters', () => {
      expect(processBase64('!@#$%^&*()', 'encode')).toBe('IUAjJCVeJiooKQ==')
    })

    it('should encode URL', () => {
      expect(processBase64('https://example.com', 'encode')).toBe('aHR0cHM6Ly9leGFtcGxlLmNvbQ==')
    })

    it('should encode emoji', () => {
      const result = processBase64('😀🎉', 'encode')
      // Emoji encoding produces valid Base64, round-trip will verify correctness
      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/)
      expect(result.length).toBeGreaterThan(10)
    })
  })

  describe('Base64 Decoding', () => {
    it('should decode simple text', () => {
      expect(processBase64('aGVsbG8=', 'decode')).toBe('hello')
    })

    it('should decode Chinese characters', () => {
      expect(processBase64('5L2g5aW9', 'decode')).toBe('你好')
    })

    it('should decode empty string', () => {
      expect(processBase64('', 'decode')).toBe('')
    })

    it('should decode special characters', () => {
      expect(processBase64('IUAjJCVeJiooKQ==', 'decode')).toBe('!@#$%^&*()')
    })

    it('should decode URL', () => {
      expect(processBase64('aHR0cHM6Ly9leGFtcGxlLmNvbQ==', 'decode')).toBe('https://example.com')
    })
  })

  describe('Base64 Round-trip', () => {
    it('should encode and decode text correctly', () => {
      const original = 'Hello, World! 你好世界'
      const encoded = processBase64(original, 'encode')
      const decoded = processBase64(encoded, 'decode')
      expect(decoded).toBe(original)
    })

    it('should handle emoji round-trip', () => {
      const original = '😀🎉🎊'
      const encoded = processBase64(original, 'encode')
      const decoded = processBase64(encoded, 'decode')
      expect(decoded).toBe(original)
    })
  })
})
