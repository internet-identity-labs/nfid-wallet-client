import { useActor } from "@xstate/react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { UnknownDeviceActor } from "frontend/state/machines/authentication/unknown-device"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { KnownDeviceCoordinator } from "./device-known"
import { UnknownDeviceCoordinator } from "./device-unknown"

export function AuthenticationCoordinator({
  actor,
}: Actor<AuthenticationActor>) {
  const [state] = useActor(actor)
  console.debug("AuthenticationCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("KnownDevice"):
      return (
        <KnownDeviceCoordinator
          actor={state.children["known-device"] as KnownDeviceActor}
        />
      )
    case state.matches("UnknownDevice"):
      return (
        <UnknownDeviceCoordinator
          actor={state.children["unknown-device"] as UnknownDeviceActor}
        />
      )
    case state.matches("IsDeviceRegistered"):
    default:
      return <ScreenResponsive isLoading />
  }
}
