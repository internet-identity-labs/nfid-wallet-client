import { useState, useEffect, useRef } from "react"

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client"

export interface UseLoadGsiScriptOptions {
  onScriptLoadSuccess?: () => void
  onScriptLoadError?: () => void
}

export default function useLoadGsiScript({
  onScriptLoadSuccess,
  onScriptLoadError,
}: UseLoadGsiScriptOptions = {}): boolean {
  const [scriptLoadedSuccessfully, setScriptLoadedSuccessfully] = useState(
    () => typeof window !== "undefined" && !!window.google?.accounts?.id,
  )

  const onScriptLoadSuccessRef = useRef(onScriptLoadSuccess)
  onScriptLoadSuccessRef.current = onScriptLoadSuccess

  const onScriptLoadErrorRef = useRef(onScriptLoadError)
  onScriptLoadErrorRef.current = onScriptLoadError

  useEffect(() => {
    const notifySuccess = () => {
      setScriptLoadedSuccessfully(true)
      onScriptLoadSuccessRef.current?.()
    }

    const notifyError = () => {
      setScriptLoadedSuccessfully(false)
      onScriptLoadErrorRef.current?.()
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SCRIPT_SRC}"]`,
    )

    if (existing) {
      if (window.google?.accounts?.id) {
        notifySuccess()
      } else {
        existing.addEventListener("load", notifySuccess, { once: true })
        existing.addEventListener("error", notifyError, { once: true })
      }
      return
    }

    const scriptTag = document.createElement("script")
    scriptTag.src = GSI_SCRIPT_SRC
    scriptTag.async = true
    scriptTag.defer = true
    scriptTag.onload = notifySuccess
    scriptTag.onerror = notifyError

    document.body.appendChild(scriptTag)
    return () => {}
  }, [])

  return scriptLoadedSuccessfully
}
