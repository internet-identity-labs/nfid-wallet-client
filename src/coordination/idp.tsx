import { useMachine } from "@xstate/react"
import React from "react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import IDPMachine, {
  IDPMachineType,
} from "frontend/state/machines/authorization/idp"
import { ErrorBanner } from "frontend/ui/molecules/error-banner"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

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
    case state.matches("Start.Handshake.Error"):
      return (
        <ScreenResponsive>
          <ErrorBanner errorMessage={state.context.error?.message} />
        </ScreenResponsive>
      )
    case state.matches("AuthenticationMachine"):
      return (
        <ScreenResponsive className="flex flex-col items-center">
          <AuthenticationCoordinator
            actor={state.children.authenticate as AuthenticationActor}
          />
        </ScreenResponsive>
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
      return <ScreenResponsive isLoading />
  }
}
