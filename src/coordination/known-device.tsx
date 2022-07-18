import { useActor } from "@xstate/react"
import React from "react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"

export function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
  const [state] = useActor(actor)

  console.log(">>", JSON.stringify(state.value))

  switch (true) {
    case state.matches("Start"):
      return <div>Loading Devices</div>
    case state.matches("Authenticate"):
    case state.matches("Login"):
      return <div>Authenticate isLoading: {state.matches("Login")}</div>
    default:
      return <div>KnownDeviceCoordinator</div>
  }
}
