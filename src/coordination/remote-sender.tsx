import { useMachine } from "@xstate/react"

import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/machines/authentication/remote-sender"

import { KnownDeviceCoordinator } from "./device-known"
import { RegistrationCoordinator } from "./registration"

interface Props {
  machine?: RemoteSenderMachineType
  successPath?: string
}

export default function RemoteIDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || RemoteSenderMachine)
  console.log(">> ", { state })

  switch (true) {
    case state.matches("KnownDevice"):
      return (
        <KnownDeviceCoordinator
          actor={state.children["known-device"] as KnownDeviceActor}
        />
      )
    case state.matches("RegistrationMachine"):
      return (
        <RegistrationCoordinator
          actor={state.children["registration"] as RegistrationActor}
        />
      )

    default:
      return <div>RemoteIDPCoordinator</div>
  }
}
