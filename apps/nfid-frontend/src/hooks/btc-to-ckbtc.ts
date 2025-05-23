import { Principal } from "@dfinity/principal"

import { btcDepositService } from "@nfid/integration/token/btc/service"

export function useBTCDepositsToMintCKBTCListener() {
  const watchBtcDeposits = (principal: Principal) => {
    if (!principal) return

    let cancelled = false
    let watcher: { clearInterval: () => void } | null = null

    const startWatcher = async () => {
      console.log("[BTCDepositsToMintCKBTCListener] Starting watcher")
      const result = await btcDepositService.monitorDeposit(principal)
      if (!cancelled) watcher = result
    }

    startWatcher()

    return () => {
      console.log("[BTCDepositsToMintCKBTCListener] Stopping watcher")
      cancelled = true
      watcher?.clearInterval()
    }
  }

  return {
    watchBtcDeposits,
  }
}
