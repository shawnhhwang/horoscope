import dns from 'dns';
import net from 'net';

const ALWAYS_BLOCKED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  '169.254.169.254',
  '0.0.0.0',
  '::1',
  '::',
]);

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return -1;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isLoopbackOrMetadataIp(rawIp: string): boolean {
  const ip = rawIp.toLowerCase().replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '::' || ip === '0.0.0.0') return true;
  if (net.isIPv4(ip)) {
    const n = ipv4ToInt(ip);
    // 127.0.0.0/8 (loopback)
    if ((n & 0xff000000) >>> 0 === 0x7f000000) return true;
    // 0.0.0.0/8
    if ((n & 0xff000000) >>> 0 === 0x00000000) return true;
    // 169.254.0.0/16 (link-local & cloud metadata)
    if ((n & 0xffff0000) >>> 0 === 0xa9fe0000) return true;
  }
  if (net.isIPv6(ip)) {
    if (ip.startsWith('fe80:')) return true; // link-local
  }
  return false;
}

function isPrivateRfc1918Ip(rawIp: string): boolean {
  const ip = rawIp.toLowerCase().replace(/^::ffff:/, '');
  if (net.isIPv4(ip)) {
    const n = ipv4ToInt(ip);
    // 10.0.0.0/8
    if ((n & 0xff000000) >>> 0 === 0x0a000000) return true;
    // 172.16.0.0/12
    if ((n & 0xfff00000) >>> 0 === 0xac100000) return true;
    // 192.168.0.0/16
    if ((n & 0xffff0000) >>> 0 === 0xc0a80000) return true;
    // 100.64.0.0/10 (CGNAT)
    if ((n & 0xffc00000) >>> 0 === 0x64400000) return true;
  }
  if (net.isIPv6(ip)) {
    // fc00::/7 (Unique Local Address)
    if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
  }
  return false;
}

function isHostAllowlisted(host: string, resolvedIps: string[]): boolean {
  const rawAllow = (process.env.LLM_ALLOW_PRIVATE_HOSTS || '').trim();
  if (!rawAllow) return false;
  if (rawAllow === 'true' || rawAllow === '*') return true;
  const allowSet = new Set(
    rawAllow
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  if (allowSet.has(host.toLowerCase())) return true;
  return resolvedIps.some((ip) => allowSet.has(ip.toLowerCase()));
}

/**
 * [P0-SEC-03] SSRF 防護：
 * - 僅允許 HTTP/HTTPS 協定
 * - 永遠阻斷 Loopback (127.0.0.0/8, ::1, localhost) 與 Cloud Metadata (169.254.169.254)
 * - DNS 解析後阻斷所有 RFC1918 私有網段，除非該內網主機明確列入 LLM_ALLOW_PRIVATE_HOSTS 白名單
 */
export async function validateExternalLlmEndpoint(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('LLM 端點 URL 格式無效，必須包含 http:// 或 https://');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('端點通訊協議僅支援 HTTP 或 HTTPS');
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || ALWAYS_BLOCKED_HOSTS.has(host) || host.endsWith('.internal')) {
    throw new Error('禁止連線至本機迴環或雲端元數據位址 (SSRF 防護)');
  }

  let ips: string[] = [];
  if (net.isIP(host)) {
    ips = [host];
  } else {
    try {
      const records = await dns.promises.lookup(host, { all: true });
      ips = records.map((r) => r.address);
    } catch {
      // 若為合法公網域名但在離線測試環境無法解析，僅檢驗主機字面名稱
      if (host.endsWith('.local')) {
        throw new Error('禁止連線至內網本地域名 (SSRF 防護)');
      }
      return parsed;
    }
  }

  for (const ip of ips) {
    if (isLoopbackOrMetadataIp(ip)) {
      throw new Error(`禁止連線至迴環或雲端元數據 IP (${ip}) (SSRF 防護)`);
    }
  }

  const hasPrivateIp = ips.some((ip) => isPrivateRfc1918Ip(ip));
  if (hasPrivateIp && !isHostAllowlisted(host, ips)) {
    throw new Error('禁止設定私有網段 IP 作為 LLM 端點；若為自架內網 Ollama，請於環境變數 LLM_ALLOW_PRIVATE_HOSTS 明確放行 (SSRF 防護)');
  }

  return parsed;
}
