import { useMachine } from "@xstate/react"
import React from "react"
import { Navigate } from "react-router-dom"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/machines/authentication/remote-sender"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: RemoteSenderMachineType
  successPath?: string
}

export default function RemoteIDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || RemoteSenderMachine)
  React.useEffect(() => {
    console.debug("RemoteIDPCoordinator", {
      state: state.value,
      context: state.context,
    })
  }, [state.value, state.context])

  switch (true) {
    case state.matches("Start"):
      return <ScreenResponsive isLoading />
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    // NOTE: I dislike having routing logic in a coordinator
    case state.matches("End"):
      return <Navigate to="/profile/security" />
    default:
      return <ScreenResponsive isLoading />
  }
}
