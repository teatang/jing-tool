import { describe, it, expect, beforeEach } from 'vitest'
import mermaid from 'mermaid'

// Mermaid 工具核心逻辑测试
describe('Mermaid Tool Core Logic', () => {
  beforeEach(() => {
    // 初始化 Mermaid 配置
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit'
    })
  })

  describe('Valid Mermaid Syntax - Flowchart', () => {
    it('should render valid flowchart syntax', async () => {
      const code = `graph TD\nA --> B\nB --> C`
      const { svg } = await mermaid.render('test-simple-flow', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
    })

    it('should render flowchart with subgraphs', async () => {
      const code = `graph TB\nsubgraph G1\nA1 --> A2\nend\nA2 --> B1`
      const { svg } = await mermaid.render('test-subgraph', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render flowchart with different arrows', async () => {
      const code = `graph LR\nA <--> B\nA -.-> D`
      const { svg } = await mermaid.render('test-arrows', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render flowchart with different shapes', async () => {
      const code = `graph TB\nA((圆形))\nB[矩形]\nC{菱形}`
      const { svg } = await mermaid.render('test-shapes', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render simple graph TD', async () => {
      const code = `graph TD\nA-->B`
      const { svg } = await mermaid.render('test-td', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render simple graph LR', async () => {
      const code = `graph LR\nA-->B`
      const { svg } = await mermaid.render('test-lr', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })
  })

  describe('Valid Mermaid Syntax - Other Diagrams', () => {
    it('should render valid state diagram syntax', async () => {
      const code = `stateDiagram-v2\n[*] --> Active\nActive --> [*]`
      const { svg } = await mermaid.render('test-state', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render valid pie chart syntax', async () => {
      const code = `pie title 水果\n"苹果" : 40\n"香蕉" : 35`
      const { svg } = await mermaid.render('test-pie', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render valid journey diagram syntax', async () => {
      const code = `journey\ntitle 测试\nsection 早上\n  起床: 3`
      const { svg } = await mermaid.render('test-journey', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render gantt chart syntax', async () => {
      const code = `gantt\ntitle 测试\nsection 设计\n任务1: a1, 2024-01-01, 7d`
      const { svg } = await mermaid.render('test-gantt', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render quadrant chart', async () => {
      const code = `quadrantChart\ntitle 测试\n"重要且紧急": [0.9, 0.9]`
      const { svg } = await mermaid.render('test-quadrant', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should render sankey diagram', async () => {
      const code = `sankey-beta\nA,B,10\nB,C,15`
      const { svg } = await mermaid.render('test-sankey', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })
  })

  describe('Invalid Mermaid Syntax', () => {
    it('should throw error for missing graph keyword', async () => {
      const code = `TD\nA --> B`
      await expect(mermaid.render('test-invalid1', code)).rejects.toThrow()
    })

    it('should throw error for invalid arrow syntax', async () => {
      const code = `graph TD\nA --> B\nB >>> C`
      await expect(mermaid.render('test-invalid2', code)).rejects.toThrow()
    })

    it('should throw error for unclosed bracket', async () => {
      const code = `graph TD\nA[开始 --> B[结束]`
      await expect(mermaid.render('test-invalid3', code)).rejects.toThrow()
    })

    it('should throw error for invalid node definition', async () => {
      const code = `graph TD\nA[ --> B[结束]`
      await expect(mermaid.render('test-invalid4', code)).rejects.toThrow()
    })

    it('should throw error for invalid keyword', async () => {
      const code = `invalidTD\nA --> B`
      await expect(mermaid.render('test-invalid9', code)).rejects.toThrow()
    })
  })

  describe('SVG Output', () => {
    it('should generate SVG with correct namespace', async () => {
      const code = `graph TD\nA --> B`
      const { svg } = await mermaid.render('test-ns', code)
      expect(svg).toContain('xmlns')
    })

    it('should generate SVG with viewBox attribute', async () => {
      const code = `graph TD\nA --> B`
      const { svg } = await mermaid.render('test-viewbox', code)
      expect(svg).toContain('viewBox')
    })

    it('should generate valid SVGs', async () => {
      const code = `graph TD\nA --> B`
      const result1 = await mermaid.render('test-same1', code)
      const result2 = await mermaid.render('test-same2', code)
      expect(result1.svg).toBeTruthy()
      expect(result2.svg).toBeTruthy()
      expect(result1.svg).toContain('<svg')
      expect(result2.svg).toContain('<svg')
    })

    it('should generate SVG with sufficient content', async () => {
      const code = `graph TD\nA --> B`
      const { svg } = await mermaid.render('test-class', code)
      expect(svg.length).toBeGreaterThan(100)
    })
  })

  describe('Special Characters', () => {
    it('should handle Chinese characters in nodes', async () => {
      const code = `graph TD\nA[开始] --> B[结束]`
      const { svg } = await mermaid.render('test-chinese', code)
      expect(svg).toBeTruthy()
      expect(svg).toContain('<svg')
    })

    it('should handle special characters in labels', async () => {
      const code = `graph LR\nA["test"] --> B`
      const { svg } = await mermaid.render('test-special', code)
      expect(svg).toBeTruthy()
    })

    it('should handle emoji in nodes', async () => {
      const code = `graph TD\nA[👍] --> B`
      const { svg } = await mermaid.render('test-emoji', code)
      expect(svg).toBeTruthy()
    })

    it('should handle numbers in nodes', async () => {
      const code = `graph TD\nA[123] --> B[456]`
      const { svg } = await mermaid.render('test-numbers', code)
      expect(svg).toBeTruthy()
    })

    it('should handle underscore in node text', async () => {
      const code = `graph TD\nA[node_text] --> B`
      const { svg } = await mermaid.render('test-underscore', code)
      expect(svg).toBeTruthy()
    })
  })

  describe('Performance', () => {
    it('should render within reasonable time', async () => {
      const code = `graph TD\nA --> B --> C --> D --> E`
      const startTime = Date.now()
      await mermaid.render('test-perf', code)
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(2000)
    })

    it('should render simple graph quickly', async () => {
      const code = `graph TD\nA-->B`
      const startTime = Date.now()
      await mermaid.render('test-perf-simple', code)
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000)
    })
  })
})
