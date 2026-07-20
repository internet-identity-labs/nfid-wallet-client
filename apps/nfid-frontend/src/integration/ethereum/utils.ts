export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 500,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (e: unknown) {
      const is429 =
        e instanceof Error &&
        (e.message.includes("429") ||
          e.message.includes("Too Many Requests") ||
          e.message.includes("-32005"))
      if (!is429 || attempt === retries - 1) throw e
      await new Promise((r) => setTimeout(r, delayMs * 2 ** attempt))
    }
  }
  throw new Error("Unreachable")
}
