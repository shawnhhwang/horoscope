import { marked } from 'marked';

/**
 * 清理可能存在 XSS 威脅的 HTML 內容，剝除危險標籤與腳本屬性
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // 1. 移除 script, iframe, object, embed, style, form 等危險標籤及其內部內容
  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. 移除所有的 inline on* 事件處理器 (如 onload, onerror, onclick, onmouseover 等)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 3. 移除 href 或 src 中的 javascript: 或 vbscript: 或 data:text/html 偽協議
  clean = clean.replace(/(href|src)\s*=\s*(["']\s*(?:javascript|vbscript|data:text\/html):[^"']*["']|\s*(?:javascript|vbscript):[^\s>]+)/gi, '$1="#"');

  return clean;
}

/**
 * 安全渲染 Markdown 為經過 XSS 消毒的 HTML
 */
export function renderSafeMarkdown(rawMarkdown: string): string {
  if (!rawMarkdown) return '';
  try {
    const rawHtml = marked.parse(rawMarkdown) as string;
    return sanitizeHtml(rawHtml);
  } catch {
    return sanitizeHtml(rawMarkdown);
  }
}
