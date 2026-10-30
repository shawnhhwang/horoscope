import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * 採用標準庫 DOMPurify 深度清理潛在 XSS 威脅，徹底過濾惡意標籤、事件屬性與偽協議
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

/**
 * 安全渲染 Markdown 為經過 DOMPurify 消毒的純淨 HTML
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
