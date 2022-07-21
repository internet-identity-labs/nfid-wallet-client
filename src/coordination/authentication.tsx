import { useActor } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { UnknownDeviceActor } from "frontend/state/machines/authentication/unknown-device"

import { KnownDeviceCoordinator } from "./device-known"
import { UnknownDeviceCoordinator } from "./device-unknown"

export function AuthenticationCoordinator({
  actor,
}: Actor<AuthenticationActor>) {
  const [state] = useActor(actor)

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
      return <Loader isLoading={true} />
  }
}
