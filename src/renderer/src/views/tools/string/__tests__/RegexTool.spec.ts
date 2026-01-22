const testRegex = (pattern: string, flags: string, testString: string): string[] => {
  try {
    const regex = new RegExp(pattern, flags)
    const results = testString.match(regex)
    return results || []
  } catch {
    throw new Error('Invalid regex')
  }
}

describe('RegexTool', () => {
  describe('Basic Matching', () => {
    it('should match simple pattern', () => {
      const result = testRegex('hello', 'g', 'hello world hello')
      expect(result).toEqual(['hello', 'hello'])
    })

    it('should match with case insensitive flag', () => {
      const result = testRegex('hello', 'gi', 'Hello HELLO hello')
      expect(result).toEqual(['Hello', 'HELLO', 'hello'])
    })

    it('should return empty array for no match', () => {
      const result = testRegex('xyz', 'g', 'hello world')
      expect(result).toEqual([])
    })
  })

  describe('Pattern Types', () => {
    it('should match digit pattern', () => {
      const result = testRegex('\\d+', 'g', 'abc123def456')
      expect(result).toEqual(['123', '456'])
    })

    it('should match word pattern', () => {
      const result = testRegex('\\w+', 'g', 'hello world')
      expect(result).toEqual(['hello', 'world'])
    })

    it('should match whitespace pattern', () => {
      const result = testRegex('\\s', 'g', 'hello world')
      expect(result).toEqual([' '])
    })

    it('should match character class', () => {
      const result = testRegex('[aeiou]', 'g', 'hello world')
      expect(result).toEqual(['e', 'o', 'o'])
    })

    it('should match negated character class', () => {
      const result = testRegex('[^aeiou]', 'g', 'hello')
      expect(result).toEqual(['h', 'l', 'l'])
    })
  })

  describe('Anchors', () => {
    it('should match start of string', () => {
      const result = testRegex('^hello', 'g', 'hello world')
      expect(result).toEqual(['hello'])
    })

    it('should match end of string', () => {
      const result = testRegex('world$', 'g', 'hello world')
      expect(result).toEqual(['world'])
    })

    it('should not match with wrong anchor', () => {
      const result = testRegex('^world', 'g', 'hello world')
      expect(result).toEqual([])
    })
  })

  describe('Quantifiers', () => {
    it('should match with star quantifier', () => {
      const result = testRegex('a*', 'g', 'baaaab')
      expect(result.length).toBeGreaterThan(0)
      expect(result.join('')).toContain('aaaa')
    })

    it('should match with plus quantifier', () => {
      const result = testRegex('a+', 'g', 'baaaab')
      expect(result).toEqual(['aaaa'])
    })

    it('should match with question mark', () => {
      const result = testRegex('a?b', 'g', 'ab baab b')
      // a? matches 0 or 1 'a', so matches 'ab' and 'b' (where 'a?' matches empty)
      expect(result).toContain('ab')
      expect(result).toContain('b')
    })
  })

  describe('Groups', () => {
    it('should match with capturing groups', () => {
      const result = testRegex('(hello)\\s(world)', 'g', 'hello world hello world')
      expect(result).toContain('hello world')
    })

    it('should match with non-capturing groups', () => {
      const result = testRegex('(?:hello)\\s(world)', 'g', 'hello world')
      expect(result).toContain('hello world')
    })
  })

  describe('Alternation', () => {
    it('should match with pipe alternation', () => {
      const result = testRegex('cat|dog', 'g', 'I have a cat and a dog')
      expect(result).toEqual(['cat', 'dog'])
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid regex', () => {
      expect(() => testRegex('[', 'g', 'test')).toThrow()
    })

    it('should throw error for unbalanced parens', () => {
      expect(() => testRegex('(abc', 'g', 'test')).toThrow()
    })
  })

  describe('Common Use Cases', () => {
    it('should match email pattern', () => {
      const emailPattern = '[\\w.-]+@[\\w.-]+\\.\\w+'
      const result = testRegex(
        emailPattern,
        'g',
        'Contact: test@example.com or support@company.org'
      )
      expect(result).toEqual(['test@example.com', 'support@company.org'])
    })

    it('should match URL pattern', () => {
      const urlPattern = 'https?://[\\w.-]+(?:/[\\w./-]*)?'
      const result = testRegex(
        urlPattern,
        'g',
        'Visit https://example.com and http://test.org/page'
      )
      expect(result.some((r) => r.includes('https://example.com'))).toBe(true)
    })

    it('should match phone number', () => {
      const phonePattern = '\\d{3}-\\d{4}-\\d{4}'
      const result = testRegex(phonePattern, 'g', 'Phone: 123-4567-8901 or 987-6543-2100')
      expect(result).toEqual(['123-4567-8901', '987-6543-2100'])
    })
  })
})
