import { useState, useEffect, useRef } from "react"

export interface UseLoadGsiScriptOptions {
  /**
   * Callback fires on load [gsi](https://accounts.google.com/gsi/client) script success
   */
  onScriptLoadSuccess?: () => void
  /**
   * Callback fires on load [gsi](https://accounts.google.com/gsi/client) script failure
   */
  onScriptLoadError?: () => void
}

export default function useLoadGsiScript({
  onScriptLoadSuccess,
  onScriptLoadError,
}: UseLoadGsiScriptOptions = {}): boolean {
  const [scriptLoadedSuccessfully, setScriptLoadedSuccessfully] =
    useState(false)

  const onScriptLoadSuccessRef = useRef(onScriptLoadSuccess)
  onScriptLoadSuccessRef.current = onScriptLoadSuccess

  const onScriptLoadErrorRef = useRef(onScriptLoadError)
  onScriptLoadErrorRef.current = onScriptLoadError

  useEffect(() => {
    const w = window as unknown as {
      google?: { accounts?: { id?: unknown } }
      __nfidGsiScriptPromise?: Promise<void>
    }

    // If GSI is already available, treat as loaded.
    if (w.google?.accounts?.id) {
      setScriptLoadedSuccessfully(true)
      onScriptLoadSuccessRef.current?.()
      return
    }

    // Ensure only a single script tag + load promise globally.
    if (!w.__nfidGsiScriptPromise) {
      w.__nfidGsiScriptPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://accounts.google.com/gsi/client"]',
        )

        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true })
          existing.addEventListener("error", () => reject(), { once: true })
          return
        }

        const scriptTag = document.createElement("script")
        scriptTag.src = "https://accounts.google.com/gsi/client"
        scriptTag.async = true
        scriptTag.defer = true
        scriptTag.onload = () => resolve()
        scriptTag.onerror = () => reject()
        document.body.appendChild(scriptTag)
      })
    }

    w.__nfidGsiScriptPromise
      .then(() => {
        setScriptLoadedSuccessfully(true)
        onScriptLoadSuccessRef.current?.()
      })
      .catch(() => {
        setScriptLoadedSuccessfully(false)
        onScriptLoadErrorRef.current?.()
      })
  }, [])

  return scriptLoadedSuccessfully
}
