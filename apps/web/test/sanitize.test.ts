import { describe, it, expect } from 'vitest';
import { sanitizeHtml, renderSafeMarkdown } from '../src/utils/sanitize';

describe('🛡️ [P1-SEC-04] XSS 淨化與 Markdown 安全渲染測試', () => {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)"><circle r="10"/></svg>',
    '<iframe src="https://evil.example/steal"></iframe>',
    '<object data="javascript:alert(1)"></object>',
    '<div onclick="alert(1)">click</div>',
    '<a href="javascript:alert(1)">XSS Link</a>',
    '<a href="JaVaScRiPt:alert(document.cookie)">Case Evasion</a>',
    '<a href="data:text/html,<script>alert(1)</script>">Data URI</a>',
    '<body onload=alert(1)>hello</body>',
  ];

  it('sanitizeHtml 應阻斷所有 OWASP XSS Filter Evasion 攻擊向量', () => {
    for (const payload of xssPayloads) {
      const cleaned = sanitizeHtml(payload);
      expect(cleaned.toLowerCase()).not.toContain('<script');
      expect(cleaned.toLowerCase()).not.toContain('<iframe');
      expect(cleaned.toLowerCase()).not.toContain('<object');
      expect(cleaned.toLowerCase()).not.toContain('<svg');
      expect(cleaned.toLowerCase()).not.toContain('onerror');
      expect(cleaned.toLowerCase()).not.toContain('onload');
      expect(cleaned.toLowerCase()).not.toContain('onclick');
      expect(cleaned.toLowerCase()).not.toContain('javascript:');
      expect(cleaned.toLowerCase()).not.toContain('data:text/html');
    }
  });

  it('renderSafeMarkdown 應保留合法命理 Markdown 排版並過濾危險標籤與連結', () => {
    const md = `## 命盤重點\n\n- **紫微化祿**：[前往檢視](/ziwei)\n- [惡意腳本](javascript:alert(1))\n\n<script>fetch('/steal')</script>`;
    const html = renderSafeMarkdown(md);
    expect(html).toContain('<h2>命盤重點</h2>');
    expect(html).toContain('<strong>紫微化祿</strong>');
    expect(html).toContain('href="/ziwei"');
    expect(html.toLowerCase()).not.toContain('javascript:');
    expect(html.toLowerCase()).not.toContain('<script');
  });
});
