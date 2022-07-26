import { useMachine } from "@xstate/react"
import React from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import IDPMachine, {
  IDPMachineType,
} from "frontend/state/machines/authorization/idp"

import { AuthenticationCoordinator } from "./authentication"
import { AuthorizationCoordinator } from "./authorization"
import { TrustDeviceCoordinator } from "./trust-device"

interface Props {
  machine?: IDPMachineType
  successPath?: string
}

export default function IDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || IDPMachine)

  React.useEffect(
    () =>
      console.debug("IDPCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    case state.matches("AuthorizationMachine"):
      return (
        <AuthorizationCoordinator
          actor={state.children.authorize as AuthorizationActor}
        />
      )
    case state.matches("TrustDevice"):
      return (
        <TrustDeviceCoordinator
          actor={state.children.trustDeviceMachine as TrustDeviceActor}
        />
      )
    case state.matches("End"):
    case state.matches("Start"):
    default:
      return <Loader isLoading={true} />
  }
}
