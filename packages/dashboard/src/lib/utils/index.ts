
export function isValidDomain(domain: string): boolean {
  // Support subdomains, domains, and common TLDs
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

export function generateDomainKey(): string {
  return "ls_" + Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export function parseUserAgent(ua: string): { browser: string | null; os: string | null; device: string | null } {
  let browser: string | null = null;
  let os: string | null = null;
  let device: string | null = 'desktop';

  // Browser detection
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  // OS detection
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device detection
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device = 'tablet';
  }

  return { browser, os, device };
}

export async function verifyDnsToken(domain: string, token: string): Promise<boolean> {
  try {
    // Use Google DNS-over-HTTPS API
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    if (!response.ok) return false;
    
    const data = await response.json() as any;
    
    if (data.Status !== 0 || !data.Answer) {
      return false;
    }

    // Check all TXT records
    // Answer format: [{ name: 'example.com.', type: 16, TTL: 300, data: '"ls-verify-..."' }]
    return data.Answer.some((record: any) => {
      // Data often comes with quotes, e.g. "value"
      const txtData = record.data.replace(/^"|"$/g, '');
      return txtData === token;
    });
  } catch (error) {
    console.error("DNS verification error:", error);
    return false;
  }
}
