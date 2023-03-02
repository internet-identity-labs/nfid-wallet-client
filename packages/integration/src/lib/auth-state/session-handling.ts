import { IdleManager, IdleManagerOptions } from "@dfinity/auth-client"

import { getLocalStorageOverride } from "../local-storage"

const idleManagerConfig = {
  idleTimeout: getLocalStorageOverride(
    1000 * 60 * 2,
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
  if (idleManager) return
  console.debug("setupIdleManager")

  idleManager = IdleManager.create({ ...options, onIdle })
}
