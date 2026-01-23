import { describe, it, expect } from 'vitest'
import { testRegex } from '@/utils/stringTools'

const extractMatches = (results: RegExpExecArray[]): string[] => {
  return results.map((m) => m[0])
}

describe('RegexTool', () => {
  describe('Basic Matching', () => {
    it('should match simple pattern', () => {
      const result = testRegex('hello', 'hello world hello', ['g'])
      expect(extractMatches(result.matches)).toEqual(['hello', 'hello'])
    })

    it('should match with case insensitive flag', () => {
      const result = testRegex('hello', 'Hello HELLO hello', ['g', 'i'])
      expect(extractMatches(result.matches)).toEqual(['Hello', 'HELLO', 'hello'])
    })

    it('should return empty array for no match', () => {
      const result = testRegex('xyz', 'hello world', ['g'])
      expect(result.matches).toEqual([])
    })
  })

  describe('Pattern Types', () => {
    it('should match digit pattern', () => {
      const result = testRegex('\\d+', 'abc123def456', ['g'])
      expect(extractMatches(result.matches)).toEqual(['123', '456'])
    })

    it('should match word pattern', () => {
      const result = testRegex('\\w+', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toEqual(['hello', 'world'])
    })

    it('should match whitespace pattern', () => {
      const result = testRegex('\\s', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toEqual([' '])
    })

    it('should match character class', () => {
      const result = testRegex('[aeiou]', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toEqual(['e', 'o', 'o'])
    })

    it('should match negated character class', () => {
      const result = testRegex('[^aeiou]', 'hello', ['g'])
      expect(extractMatches(result.matches)).toEqual(['h', 'l', 'l'])
    })
  })

  describe('Anchors', () => {
    it('should match start of string', () => {
      const result = testRegex('^hello', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toEqual(['hello'])
    })

    it('should match end of string', () => {
      const result = testRegex('world$', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toEqual(['world'])
    })

    it('should not match with wrong anchor', () => {
      const result = testRegex('^world', 'hello world', ['g'])
      expect(result.matches).toEqual([])
    })
  })

  describe('Quantifiers', () => {
    it('should match with star quantifier', () => {
      const result = testRegex('a*', 'baaaab', ['g'])
      expect(result.matches.length).toBeGreaterThan(0)
      expect(extractMatches(result.matches).join('')).toContain('aaaa')
    })

    it('should match with plus quantifier', () => {
      const result = testRegex('a+', 'baaaab', ['g'])
      expect(extractMatches(result.matches)).toEqual(['aaaa'])
    })

    it('should match with question mark', () => {
      const result = testRegex('a?b', 'ab baab b', ['g'])
      // a? matches 0 or 1 'a', so matches 'ab' and 'b' (where 'a?' matches empty)
      const matches = extractMatches(result.matches)
      expect(matches).toContain('ab')
      expect(matches).toContain('b')
    })
  })

  describe('Groups', () => {
    it('should match with capturing groups', () => {
      const result = testRegex('(hello)\\s(world)', 'hello world hello world', ['g'])
      expect(extractMatches(result.matches)).toContain('hello world')
    })

    it('should match with non-capturing groups', () => {
      const result = testRegex('(?:hello)\\s(world)', 'hello world', ['g'])
      expect(extractMatches(result.matches)).toContain('hello world')
    })
  })

  describe('Alternation', () => {
    it('should match with pipe alternation', () => {
      const result = testRegex('cat|dog', 'I have a cat and a dog', ['g'])
      expect(extractMatches(result.matches)).toEqual(['cat', 'dog'])
    })
  })

  describe('Error Handling', () => {
    it('should return error for invalid regex', () => {
      const result = testRegex('[', 'test', ['g'])
      expect(result.error).toBeDefined()
    })

    it('should return error for unbalanced parens', () => {
      const result = testRegex('(abc', 'test', ['g'])
      expect(result.error).toBeDefined()
    })
  })

  describe('Common Use Cases', () => {
    it('should match email pattern', () => {
      const emailPattern = '[\\w.-]+@[\\w.-]+\\.\\w+'
      const result = testRegex(emailPattern, 'Contact: test@example.com or support@company.org', [
        'g'
      ])
      expect(extractMatches(result.matches)).toEqual(['test@example.com', 'support@company.org'])
    })

    it('should match URL pattern', () => {
      const urlPattern = 'https?://[\\w.-]+(?:/[\\w./-]*)?'
      const result = testRegex(urlPattern, 'Visit https://example.com and http://test.org/page', [
        'g'
      ])
      const matches = extractMatches(result.matches)
      expect(matches.some((r) => r.includes('https://example.com'))).toBe(true)
    })

    it('should match phone number', () => {
      const phonePattern = '\\d{3}-\\d{4}-\\d{4}'
      const result = testRegex(phonePattern, 'Phone: 123-4567-8901 or 987-6543-2100', ['g'])
      expect(extractMatches(result.matches)).toEqual(['123-4567-8901', '987-6543-2100'])
    })
  })

  describe('Match Position', () => {
    it('should store match index', () => {
      const result = testRegex('hello', 'hello world hello', ['g'])
      expect(result.matches[0].index).toBe(0)
      expect(result.matches[1].index).toBe(12)
    })

    it('should handle zero-width matches', () => {
      const result = testRegex('^', 'line1\nline2\nline3', ['g', 'm'])
      // Each ^ matches at position 0, 6, 12
      expect(result.matches.length).toBe(3)
    })
  })
})
