import { useMachine } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import IDPMachine, {
  IDPMachineType,
} from "frontend/state/machines/authorization/idp"

import { AuthenticationCoordinator } from "./authentication"
import { AuthorizationCoordinator } from "./authorization"

interface Props {
  machine?: IDPMachineType
  successPath?: string
}

export default function IDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || IDPMachine)

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
    case state.matches("Start"):
    default:
      return <Loader isLoading={true} />
  }
}
