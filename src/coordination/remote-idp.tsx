import { useMachine } from "@xstate/react"

import RemoteSenderMachine, {
  RemoteSenderMachineType,
} from "frontend/state/authentication/remote-sender"

interface Props {
  machine?: RemoteSenderMachineType
  successPath?: string
}

export default function RemoteIDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || RemoteSenderMachine)
  console.log(">> ", { state })

  switch (true) {
    default:
      return <div>RemoteIDPCoordinator</div>
  }
}
