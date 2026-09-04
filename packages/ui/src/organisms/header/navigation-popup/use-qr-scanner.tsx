import { useCallback, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

export type QrScannerState = "idle" | "scanning" | "error"

export function useQrScanner(
  elementId: string,
  onScanned: (value: string) => void,
) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [state, setState] = useState<QrScannerState>("idle")
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    setError(null)
    setState("scanning")

    try {
      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanned(decodedText)
          scanner.stop().catch(() => {})
          scannerRef.current = null
          setState("idle")
        },
        () => {},
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied"
      setError(msg)
      setState("error")
      scannerRef.current = null
    }
  }, [elementId, onScanned])

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      scannerRef.current = null
    }
    setState("idle")
    setError(null)
  }, [])

  return { state, error, start, stop }
}
