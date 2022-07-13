import { useActor } from "@xstate/react"
import React from "react"

import { KnownDeviceActor } from "frontend/state/authentication/known-device"

type NewType = Actor<KnownDeviceActor>

export function KnownDeviceCoordinator({ actor }: NewType) {
  const [state] = useActor(actor)

  React.useEffect(
    () => console.log(`KnownDeviceMachine: ${state.value}`),
    [state.value],
  )

  switch (true) {
    default:
      return <div>KnownDeviceCoordinator</div>
  }
}
