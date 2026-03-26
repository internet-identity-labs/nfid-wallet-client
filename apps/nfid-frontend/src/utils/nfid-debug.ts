export function isNFIDDebugEnabled() {
  if (typeof window === "undefined") return false

  try {
    const url = new URL(window.location.href)
    if (url.searchParams.get("nfidDebug") === "1") return true
    return window.localStorage.getItem("nfidDebug") === "1"
  } catch {
    return false
  }
}

export function debugWarn(message: string, data?: unknown) {
  if (!isNFIDDebugEnabled()) return

   
  console.warn(message, data)
}
