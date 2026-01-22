const testRegex = (pattern: string, flags: string, testString: string): RegExpExecArray[] => {
  const results: RegExpExecArray[] = []
  try {
    const regex = new RegExp(pattern, flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(testString)) !== null) {
      results.push(match)
      // 避免无限循环（对于零宽度匹配）
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }
  } catch {
    throw new Error('Invalid regex')
  }
  return results
}

const extractMatches = (results: RegExpExecArray[]): string[] => {
  return results.map((m) => m[0])
}

describe('RegexTool', () => {
  describe('Basic Matching', () => {
    it('should match simple pattern', () => {
      const result = testRegex('hello', 'g', 'hello world hello')
      expect(extractMatches(result)).toEqual(['hello', 'hello'])
    })

    it('should match with case insensitive flag', () => {
      const result = testRegex('hello', 'gi', 'Hello HELLO hello')
      expect(extractMatches(result)).toEqual(['Hello', 'HELLO', 'hello'])
    })

    it('should return empty array for no match', () => {
      const result = testRegex('xyz', 'g', 'hello world')
      expect(result).toEqual([])
    })
  })

  describe('Pattern Types', () => {
    it('should match digit pattern', () => {
      const result = testRegex('\\d+', 'g', 'abc123def456')
      expect(extractMatches(result)).toEqual(['123', '456'])
    })

    it('should match word pattern', () => {
      const result = testRegex('\\w+', 'g', 'hello world')
      expect(extractMatches(result)).toEqual(['hello', 'world'])
    })

    it('should match whitespace pattern', () => {
      const result = testRegex('\\s', 'g', 'hello world')
      expect(extractMatches(result)).toEqual([' '])
    })

    it('should match character class', () => {
      const result = testRegex('[aeiou]', 'g', 'hello world')
      expect(extractMatches(result)).toEqual(['e', 'o', 'o'])
    })

    it('should match negated character class', () => {
      const result = testRegex('[^aeiou]', 'g', 'hello')
      expect(extractMatches(result)).toEqual(['h', 'l', 'l'])
    })
  })

  describe('Anchors', () => {
    it('should match start of string', () => {
      const result = testRegex('^hello', 'g', 'hello world')
      expect(extractMatches(result)).toEqual(['hello'])
    })

    it('should match end of string', () => {
      const result = testRegex('world$', 'g', 'hello world')
      expect(extractMatches(result)).toEqual(['world'])
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
      expect(extractMatches(result).join('')).toContain('aaaa')
    })

    it('should match with plus quantifier', () => {
      const result = testRegex('a+', 'g', 'baaaab')
      expect(extractMatches(result)).toEqual(['aaaa'])
    })

    it('should match with question mark', () => {
      const result = testRegex('a?b', 'g', 'ab baab b')
      // a? matches 0 or 1 'a', so matches 'ab' and 'b' (where 'a?' matches empty)
      const matches = extractMatches(result)
      expect(matches).toContain('ab')
      expect(matches).toContain('b')
    })
  })

  describe('Groups', () => {
    it('should match with capturing groups', () => {
      const result = testRegex('(hello)\\s(world)', 'g', 'hello world hello world')
      expect(extractMatches(result)).toContain('hello world')
    })

    it('should match with non-capturing groups', () => {
      const result = testRegex('(?:hello)\\s(world)', 'g', 'hello world')
      expect(extractMatches(result)).toContain('hello world')
    })
  })

  describe('Alternation', () => {
    it('should match with pipe alternation', () => {
      const result = testRegex('cat|dog', 'g', 'I have a cat and a dog')
      expect(extractMatches(result)).toEqual(['cat', 'dog'])
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
      expect(extractMatches(result)).toEqual(['test@example.com', 'support@company.org'])
    })

    it('should match URL pattern', () => {
      const urlPattern = 'https?://[\\w.-]+(?:/[\\w./-]*)?'
      const result = testRegex(
        urlPattern,
        'g',
        'Visit https://example.com and http://test.org/page'
      )
      const matches = extractMatches(result)
      expect(matches.some((r) => r.includes('https://example.com'))).toBe(true)
    })

    it('should match phone number', () => {
      const phonePattern = '\\d{3}-\\d{4}-\\d{4}'
      const result = testRegex(phonePattern, 'g', 'Phone: 123-4567-8901 or 987-6543-2100')
      expect(extractMatches(result)).toEqual(['123-4567-8901', '987-6543-2100'])
    })
  })

  describe('Match Position', () => {
    it('should store match index', () => {
      const result = testRegex('hello', 'g', 'hello world hello')
      expect(result[0].index).toBe(0)
      expect(result[1].index).toBe(12)
    })

    it('should handle zero-width matches', () => {
      const result = testRegex('^', 'gm', 'line1\nline2\nline3')
      // Each ^ matches at position 0, 6, 12
      expect(result.length).toBe(3)
    })
  })
})
