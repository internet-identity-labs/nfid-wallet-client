import { useActor } from "@xstate/react"
import React from "react"

import { SignMessageActor } from "./machine"
import { SignMessage } from "./ui"

interface SignMessageCoordinatorProps {
  actor: SignMessageActor
  enforceSingleAccountScreen?: boolean
}

export function NFIDSignMessageCoordinator({
  actor,
  enforceSingleAccountScreen,
}: SignMessageCoordinatorProps) {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.debug("SignMessageCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    default:
      return (
        <SignMessage
          onCancel={() => send("END")}
          onSign={() => send({ type: "SIGN", data: state.context?.rpcMessage })}
          isLoading={state.matches("SignTypedDataV4")}
          applicationLogo={state.context?.appMeta?.logo}
          applicationURL={state.context?.appMeta?.url}
        />
      )
  }
}
