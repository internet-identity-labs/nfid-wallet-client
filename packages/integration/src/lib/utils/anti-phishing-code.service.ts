const ANTI_PHISHING_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export const antiPhishingCodeService = {
  generate(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    const chars = Array.from(
      bytes,
      (byte) => ANTI_PHISHING_CHARS[byte % ANTI_PHISHING_CHARS.length],
    )
    return `${chars.slice(0, 3).join("")}-${chars.slice(3).join("")}`
  },
}
