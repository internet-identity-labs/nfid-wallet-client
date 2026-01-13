import { IdleManager, IdleManagerOptions } from "@dfinity/auth-client"

import { matchPath } from "react-router-dom"

import { ROUTE_EMBED, TEN_MINUTES_IN_MS } from "@nfid/config"

const idleManagerConfig = {
  idleTimeout: TEN_MINUTES_IN_MS,
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
  const isDisabledOnEmbed = !!matchPath(ROUTE_EMBED, window.location.pathname)
  const isAlreadySetup = idleManager !== null
  console.debug("setupIdleManager", {
    isDisabledOnEmbed,
    isAlreadySetup,
  })
  if (isDisabledOnEmbed || isAlreadySetup) return

  idleManager = IdleManager.create({ ...options, onIdle })
}
