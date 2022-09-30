import { useMachine } from "@xstate/react"
import React from "react"
import { Navigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/machines/authentication/remote-sender"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: RemoteSenderMachineType
  successPath?: string
}

export default function RemoteIDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || RemoteSenderMachine)
  const { isAuthenticated } = useAuthentication()
  React.useEffect(() => {
    console.debug("RemoteIDPCoordinator", {
      state: state.value,
      context: state.context,
    })
  }, [state.value, state.context])

  switch (true) {
    case state.matches("Start"):
      return <BlurredLoader isLoading />
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    // NOTE: I dislike having routing logic in a coordinator
    case state.matches("End") && isAuthenticated:
      return <Navigate to="/profile/security" />
    default:
      return <BlurredLoader isLoading />
  }
}
