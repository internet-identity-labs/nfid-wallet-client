import { Principal } from "@dfinity/principal"

import { btcDepositService } from "@nfid/integration/token/btc/service"
import { useEffect, useRef } from "react"

export function useBTCDepositsToMintCKBTCListener(principal: Principal | null) {
  const watcherRef = useRef<{ clearInterval: () => void } | null>(null)

  useEffect(() => {
    if (!principal) return

    let cancelled = false

    const startWatcher = async () => {
      console.log("[BTCDepositsToMintCKBTCListener] Starting watcher for", principal.toText())
      const result = await btcDepositService.monitorDeposit(principal)
      if (!cancelled) {
        watcherRef.current = result
      }
    }

    startWatcher()

    return () => {
      console.log("[BTCDepositsToMintCKBTCListener] Stopping watcher")
      cancelled = true
      watcherRef.current?.clearInterval()
      watcherRef.current = null
    }
  }, [principal])
}
