import { IdleManager } from "@dfinity/auth-client"

const idleManagerConfig = {
  idleTimeout: 1000 * 60 * 2,
}
let idleManager: IdleManager | null

export const setupSessionManager = ({ onIdle }: { onIdle: () => void }) => {
  if (idleManager) return
  console.debug("setupIdleManager")

  idleManager = IdleManager.create({ ...idleManagerConfig, onIdle })
}
