import { useMachine } from "@xstate/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import NFIDAuthenticationMachine, {
  NFIDAuthenticationType,
} from "frontend/state/machines/nfid/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthenticationCoordinator } from "./authentication"
import { TrustDeviceCoordinator } from "./trust-device"

interface Props {
  machine?: NFIDAuthenticationType
  successPath?: string
}

export default function NFIDAuthenticationCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || NFIDAuthenticationMachine)
  const { isAuthenticated } = useAuthentication()
  const navigate = useNavigate()

  React.useEffect(() => {
    console.debug("NFIDAuthenticationCoordinator", { state: state.value })
  }, [state.value])

  React.useEffect(() => {
    if (state.value === "End" && isAuthenticated) {
      navigate("/profile/assets")
    }
  }, [isAuthenticated, navigate, state.value])

  switch (true) {
    case state.matches("Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={state.children.AuthenticationMachine as AuthenticationActor}
        />
      )
    case state.matches("TrustDevice"):
      return (
        <TrustDeviceCoordinator
          actor={state.children.trustDeviceMachine as TrustDeviceActor}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
