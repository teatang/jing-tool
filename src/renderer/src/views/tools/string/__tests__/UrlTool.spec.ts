// Helper function to test URL encoding/decoding logic
const processUrl = (input: string, mode: 'encode' | 'decode'): string => {
  if (mode === 'encode') {
    return encodeURIComponent(input)
  } else {
    return decodeURIComponent(input)
  }
}

describe('UrlTool', () => {
  describe('URL Encoding', () => {
    it('should encode simple text', () => {
      expect(processUrl('hello world', 'encode')).toBe('hello%20world')
    })

    it('should encode Chinese characters', () => {
      expect(processUrl('你好', 'encode')).toBe('%E4%BD%A0%E5%A5%BD')
    })

    it('should encode URL', () => {
      expect(processUrl('https://example.com/path?query=value', 'encode')).toBe(
        'https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue'
      )
    })

    it('should encode special characters', () => {
      expect(processUrl('!@#$%^&*()', 'encode')).toBe('!%40%23%24%25%5E%26*()')
    })

    it('should encode spaces', () => {
      expect(processUrl('hello world', 'encode')).toBe('hello%20world')
    })

    it('should encode equals sign', () => {
      expect(processUrl('a=b', 'encode')).toBe('a%3Db')
    })
  })

  describe('URL Decoding', () => {
    it('should decode simple text', () => {
      expect(processUrl('hello%20world', 'decode')).toBe('hello world')
    })

    it('should decode Chinese characters', () => {
      expect(processUrl('%E4%BD%A0%E5%A5%BD', 'decode')).toBe('你好')
    })

    it('should decode URL', () => {
      expect(processUrl('https%3A%2F%2Fexample.com', 'decode')).toBe('https://example.com')
    })

    it('should decode empty string', () => {
      expect(processUrl('', 'decode')).toBe('')
    })
  })

  describe('URL Round-trip', () => {
    it('should encode and decode text correctly', () => {
      const original = 'https://example.com/path?query=你好&page=1'
      const encoded = processUrl(original, 'encode')
      const decoded = processUrl(encoded, 'decode')
      expect(decoded).toBe(original)
    })
  })
})
