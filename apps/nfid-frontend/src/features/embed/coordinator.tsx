import { useMachine } from "@xstate/react"
import React from "react"

import { AuthenticationCoordinator } from "frontend/coordination/authentication"
import { TrustDeviceCoordinator } from "frontend/coordination/trust-device"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"

import { NFIDCheckoutCoordinator } from "../checkout/coordinator"
import { CheckoutMachineActor } from "../checkout/machine"
import { NFIDConnectAccountCoordinator } from "../embed-connect-account/coordinator"
import { NFIDConnectAccountActor } from "../embed-connect-account/machines"
import { NFIDEmbedMachine } from "./machines"

export const NFIDEmbedCoordinator = () => {
  const [state] = useMachine(NFIDEmbedMachine)

  React.useEffect(
    () =>
      console.log("NFIDEmbedCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    case state.matches("ConnectAccount"):
      return (
        <NFIDConnectAccountCoordinator
          actor={
            state.children.EmbedConnectAccountMachine as NFIDConnectAccountActor
          }
        />
      )
    case state.matches("CheckoutMachine"):
      return (
        <NFIDCheckoutCoordinator
          actor={state.children.CheckoutMachine as CheckoutMachineActor}
        />
      )

    case state.matches("TrustDevice"):
      return (
        <TrustDeviceCoordinator
          actor={state.children.trustDeviceMachine as TrustDeviceActor}
        />
      )
    case state.matches("SignTypedDataV4"):
      return <div>SignTypedDataV4</div>
    case state.matches("Ready"):
      return <div>Waiting for RPC Messages</div>
    case state.matches("Error"):
      return <div>Some Error happened</div>
    default:
      return <div>NFIDEmbedCoordinator</div>
  }
}
