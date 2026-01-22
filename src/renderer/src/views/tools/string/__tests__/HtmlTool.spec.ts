const formatHtml = (input: string, format: 'format' | 'minify'): string => {
  if (format === 'format') {
    const formatted = input
      .replace(/></g, '>\n<')
      .replace(/>\s+</g, '>\n  <')
      .replace(/>\s+</g, '>\n  <')
    return formatted.trim()
  } else {
    return input.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
  }
}

describe('HtmlTool', () => {
  describe('HTML Formatting', () => {
    it('should format simple HTML', () => {
      const input = '<div><span>Hello</span></div>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('<div>')
      expect(result).toContain('</div>')
      expect(result).toContain('\n')
    })

    it('should format nested HTML', () => {
      const input = '<html><body><div><p>Content</p></div></body></html>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('<html>')
      expect(result).toContain('<body>')
      expect(result).toContain('<div>')
      expect(result).toContain('<p>')
    })

    it('should format self-closing tags', () => {
      const input = '<br/><img src="test.png"/>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('<br')
      expect(result).toContain('<img')
    })
  })

  describe('HTML Minifying', () => {
    it('should minify simple HTML', () => {
      const input = '<div>\n  <span>Hello</span>\n</div>'
      const result = formatHtml(input, 'minify')
      expect(result).toBe('<div><span>Hello</span></div>')
    })

    it('should minify HTML structure', () => {
      const input = '<div>  Hello   World  </div>'
      const result = formatHtml(input, 'minify')
      // Minify removes line breaks and extra whitespace between tags
      expect(result).not.toContain('\n')
      expect(result).toContain('<div>')
      expect(result).toContain('Hello World')
    })

    it('should handle attributes', () => {
      const input = '<div class="test" id="main">Content</div>'
      const result = formatHtml(input, 'minify')
      expect(result).toBe('<div class="test" id="main">Content</div>')
    })
  })

  describe('HTML Round-trip', () => {
    it('should format and minify back correctly', () => {
      const original = '<div><span>Test</span></div>'
      const formatted = formatHtml(original, 'format')
      const minified = formatHtml(formatted, 'minify')
      expect(minified).toBe('<div><span>Test</span></div>')
    })
  })

  describe('HTML with Content', () => {
    it('should preserve text content', () => {
      const input = '<div>Hello World</div>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('Hello World')
    })

    it('should handle script tags', () => {
      const input = '<script>console.log("test")</script>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('<script>')
      expect(result).toContain('console.log')
    })

    it('should handle style tags', () => {
      const input = '<style>.test{color:red}</style>'
      const result = formatHtml(input, 'format')
      expect(result).toContain('<style>')
      expect(result).toContain('.test')
    })
  })
})
