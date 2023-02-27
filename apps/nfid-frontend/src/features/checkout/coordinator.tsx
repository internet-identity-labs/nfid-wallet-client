import { useActor } from "@xstate/react"
import { TransferModalSuccess } from "packages/ui/src/organisms/transfer-modal/sucess"
import React from "react"

import { IconCmpLoading } from "@nfid-frontend/ui"

import { CheckoutMachineActor } from "./machine"
import { CheckoutPage } from "./ui/checkout"
import { CheckoutPreloader } from "./ui/preloader"
import { TransactionDetails } from "./ui/transactions"

interface CheckoutCoordinatorProps {
  actor: CheckoutMachineActor
  enforceSingleAccountScreen?: boolean
}

export function NFIDCheckoutCoordinator({
  actor,
  enforceSingleAccountScreen,
}: CheckoutCoordinatorProps) {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.log("CheckoutCoordination", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("Preloader"):
      return <CheckoutPreloader />
    case state.matches("Checkout"):
      return (
        <CheckoutPage
          showTransactionDetails={() =>
            send({ type: "SHOW_TRANSACTION_DETAILS" })
          }
          onApprove={() =>
            send({ type: "VERIFY", data: state.context?.rpcMessage })
          }
          onCancel={() => send({ type: "CLOSE" })}
          applicationURL={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
        />
      )
    case state.matches("TransactionDetails"):
      return <TransactionDetails onClose={() => send({ type: "BACK" })} />
    case state.matches("Verifying"):
      return (
        <div className="flex items-center justify-center w-full h-full">
          <IconCmpLoading />
          <p className="font-bold">{state.context?.transactionStatus}...</p>
        </div>
      )
    case state.matches("Ramp"):
      return <div>Ramp</div>
    case state.matches("Success"):
      return (
        <TransferModalSuccess
          transactionMessage="You just bought “Solo Sensei #2969”"
          onClose={() => send({ type: "CLOSE" })}
        />
      )
    default:
      return <CheckoutPreloader />
  }
}
