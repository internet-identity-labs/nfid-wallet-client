import { IdleManager, IdleManagerOptions } from "@dfinity/auth-client"
import { matchPath } from "react-router-dom"

import { TEN_MINUTES_IN_MS } from "@nfid/config"

import { getLocalStorageOverride } from "../local-storage"

const idleManagerConfig = {
  idleTimeout: getLocalStorageOverride(
    TEN_MINUTES_IN_MS,
    "NFID_SESSION_MANAGER_IDLE_TIMEOUT_MS",
  ),
}

let idleManager: IdleManager | null = null

type SetupSessionManagerArgs = {
  options?: IdleManagerOptions
  onIdle: () => void
}

export const setupSessionManager = ({
  options = idleManagerConfig,
  onIdle,
}: SetupSessionManagerArgs) => {
  const isAlreadySetup = idleManager !== null
  console.debug("setupIdleManager", {
    isAlreadySetup,
  })
  if (isAlreadySetup) return

  idleManager = IdleManager.create({ ...options, onIdle })
}
