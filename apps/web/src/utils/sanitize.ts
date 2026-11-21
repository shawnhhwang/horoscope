import { marked } from 'marked';
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
  'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class'];

const FORBID_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'style', 'link', 'meta', 'base'];

const FORBID_ATTR = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'style', 'formaction', 'srcdoc',
];

let hookRegistered = false;
function ensureDomPurifyHook() {
  if (hookRegistered || typeof DOMPurify?.addHook !== 'function') return;
  hookRegistered = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = (node.getAttribute('href') || '').trim();
      if (/^(javascript|vbscript|data):/i.test(href)) {
        node.removeAttribute('href');
      }
      if (node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
}

/**
 * 採用標準庫 DOMPurify 嚴格白名單深度清理潛在 XSS 威脅，
 * 徹底過濾 <script>、<iframe>、<object>、on* 事件屬性與 javascript: 偽協議連結。
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  ensureDomPurifyHook();
  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/(?!\/)|#)/i,
  });
  return clean;
}

/**
 * 安全渲染 Markdown 為經過 DOMPurify 嚴格白名單消毒的純淨 HTML
 */
export function renderSafeMarkdown(rawMarkdown: string): string {
  if (!rawMarkdown) return '';
  try {
    const rawHtml = marked.parse(rawMarkdown, { async: false }) as string;
    return sanitizeHtml(rawHtml);
  } catch {
    return sanitizeHtml(rawMarkdown);
  }
}
