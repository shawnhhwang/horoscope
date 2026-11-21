import crypto from 'crypto';

const PREFIX = 'enc:v1:';
let hasWarnedMissingKey = false;

function getEncryptionKey(): Buffer {
  const envKey = process.env.LLM_ENCRYPTION_KEY;
  if (!envKey && process.env.NODE_ENV === 'production' && !hasWarnedMissingKey) {
    hasWarnedMissingKey = true;
    console.warn('⚠️ [SECURITY WARNING]: LLM_ENCRYPTION_KEY is not set; falling back to JWT_SECRET derivation.');
  }
  const source = envKey || process.env.JWT_SECRET || 'celestial_dev_llm_encryption_key_2026';
  return crypto.createHash('sha256').update(source).digest();
}

/**
 * 使用 AES-256-GCM 加密敏感金鑰（如第三方 LLM API Key）
 */
export function encryptSecret(plain: string): string {
  const trimmed = (plain || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith(PREFIX)) return trimmed;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * 解密 AES-256-GCM 儲存之金鑰；若為舊版明文則相容原樣回傳
 */
export function decryptSecret(stored: string): string {
  const trimmed = (stored || '').trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith(PREFIX)) return trimmed;

  try {
    const rest = trimmed.slice(PREFIX.length);
    const [ivHex, tagHex, dataHex] = rest.split(':');
    if (!ivHex || !tagHex || !dataHex) return '';

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

/**
 * 遮罩敏感 API Key，僅顯示前後字元（例如 sk-****abcd）
 */
export function maskSecret(plain: string): string {
  const trimmed = (plain || '').trim();
  if (!trimmed) return '';
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
}
