import { Principal } from "@dfinity/principal"

import { useEffect, useRef } from "react"

import { btcDepositService } from "@nfid/integration/token/btc/service"

export function useBTCDepositsToMintCKBTCListener(principal: Principal | null) {
  const watcherRef = useRef<{ clearInterval: () => void } | null>(null)

  useEffect(() => {
    if (!principal) return

    let cancelled = false

    const startWatcher = async () => {
      console.debug(
        "[BTCDepositsToMintCKBTCListener] Starting watcher for",
        principal.toText(),
      )
      const result = await btcDepositService.monitorDeposit(principal)
      if (!cancelled) {
        watcherRef.current = result
      }
    }

    startWatcher()

    return () => {
      console.debug("[BTCDepositsToMintCKBTCListener] Stopping watcher")
      cancelled = true
      watcherRef.current?.clearInterval()
      watcherRef.current = null
    }
  }, [principal])
}
