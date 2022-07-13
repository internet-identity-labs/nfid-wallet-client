import { useMachine } from "@xstate/react"

import { KnownDeviceActor } from "frontend/state/authentication/known-device"
import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/authentication/remote-sender"

import { KnownDeviceCoordinator } from "./known-device"

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

    default:
      return <div>RemoteIDPCoordinator</div>
  }
}
