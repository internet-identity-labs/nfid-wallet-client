import { useActor } from "@xstate/react"
import React from "react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"

export function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start"):
      return <div>Loading Devices</div>
    case state.matches("Authenticate"):
    case state.matches("Login"):
      return (
        <div>
          {state.context.isSingleAccountApplication ? (
            <div>Authenticate SingleAccount</div>
          ) : (
            <div>Authenticate MultiAccount</div>
          )}
          <button onClick={() => send("UNLOCK")}>Login</button>
        </div>
      )
    default:
      return <div>KnownDeviceCoordinator</div>
  }
}
