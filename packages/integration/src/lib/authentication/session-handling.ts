import { IdleManager, IdleManagerOptions } from "@dfinity/auth-client"
import { matchPath } from "react-router-dom"

import { ROUTE_EMBED, TEN_MINUTES_IN_MS } from "@nfid/config"

import { getLocalStorageOverride } from "../local-storage"

const idleManagerConfig = {
  idleTimeout: getLocalStorageOverride(
    TEN_MINUTES_IN_MS,
    "NFID_SESSION_MANAGER_IDLE_TIMEOUT_MS",
  ),
}

let idleManager: IdleManager | null

type SetupSessionManagerArgs = {
  options?: IdleManagerOptions
  onIdle: () => void
}

export const setupSessionManager = ({
  options = idleManagerConfig,
  onIdle,
}: SetupSessionManagerArgs) => {
  if (matchPath(ROUTE_EMBED, window.location.pathname)) return
  if (idleManager) return
  console.debug("setupIdleManager")

  idleManager = IdleManager.create({ ...options, onIdle })
}
