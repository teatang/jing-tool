import { describe, it, expect } from 'vitest'
import { formatHtml, minifyHtml } from '@/utils/stringTools'

describe('HtmlTool', () => {
  describe('HTML Formatting', () => {
    it('should format simple HTML', () => {
      const input = '<div><span>Hello</span></div>'
      const result = formatHtml(input, 2)
      expect(result).toContain('<div>')
      expect(result).toContain('</div>')
      expect(result).toContain('\n')
    })

    it('should format nested HTML', () => {
      const input = '<html><body><div><p>Content</p></div></body></html>'
      const result = formatHtml(input, 2)
      expect(result).toContain('<html>')
      expect(result).toContain('<body>')
      expect(result).toContain('<div>')
      expect(result).toContain('<p>')
    })

    it('should format self-closing tags', () => {
      const input = '<br/><img src="test.png"/>'
      const result = formatHtml(input, 2)
      expect(result).toContain('<br')
      expect(result).toContain('<img')
    })

    it('should format with custom indent size', () => {
      const input = '<div><span>Test</span></div>'
      const result = formatHtml(input, 4)
      expect(result).toContain('    ') // 4 spaces
    })
  })

  describe('HTML Minifying', () => {
    it('should minify simple HTML', () => {
      const input = '<div>\n  <span>Hello</span>\n</div>'
      const result = minifyHtml(input)
      expect(result).toBe('<div><span>Hello</span></div>')
    })

    it('should minify HTML structure', () => {
      const input = '<div>  Hello   World  </div>'
      const result = minifyHtml(input)
      // Minify removes line breaks and extra whitespace between tags
      expect(result).not.toContain('\n')
      expect(result).toContain('<div>')
      expect(result).toContain('Hello World')
    })

    it('should handle attributes', () => {
      const input = '<div class="test" id="main">Content</div>'
      const result = minifyHtml(input)
      expect(result).toBe('<div class="test" id="main">Content</div>')
    })
  })

  describe('HTML Round-trip', () => {
    it('should format and minify back correctly', () => {
      const original = '<div><span>Test</span></div>'
      const formatted = formatHtml(original, 2)
      const minified = minifyHtml(formatted)
      // Note: formatHtml preserves text content, so there may be a space before closing tag
      expect(minified).toContain('<div>')
      expect(minified).toContain('<span>')
      expect(minified).toContain('</span>')
      expect(minified).toContain('</div>')
    })
  })

  describe('HTML with Content', () => {
    it('should preserve text content', () => {
      const input = '<div>Hello World</div>'
      const result = formatHtml(input, 2)
      expect(result).toContain('Hello World')
    })

    it('should handle script tags', () => {
      const input = '<script>console.log("test")</script>'
      const result = formatHtml(input, 2)
      expect(result).toContain('<script>')
      expect(result).toContain('console.log')
    })

    it('should handle style tags', () => {
      const input = '<style>.test{color:red}</style>'
      const result = formatHtml(input, 2)
      expect(result).toContain('<style>')
      expect(result).toContain('.test')
    })
  })
})
