import { useMachine } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/machines/authentication/remote-sender"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"

import { AuthenticationCoordinator } from "./authentication"
import { AuthorizationCoordinator } from "./authorization"

interface Props {
  machine?: RemoteSenderMachineType
  successPath?: string
}

export default function RemoteIDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || RemoteSenderMachine)
  console.log(">> RemoteIDPCoordinator", {
    state: state.value,
    context: state.context,
  })

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
    case state.matches("End"):
    default:
      return <Loader isLoading={true} />
  }
}
