import { useActor } from "@xstate/react"
import React from "react"

import { BuyComponent } from "./components/buy"
import { DetailsComponent } from "./components/details"
import { SellComponent } from "./components/sell"
import { SuccessComponent } from "./components/success"
import { EmbedControllerMachineActor } from "./machine"
import { PostloaderComponent } from "./ui/postloader"
import { RPCPreloader } from "./ui/preloader"

interface EmbedControllerProps {
  actor: EmbedControllerMachineActor
}

export const EmbedControllerCoordinator = ({ actor }: EmbedControllerProps) => {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.log("EmbedControllerCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("Initial.UI.DecodeRequest"):
    case state.matches("Initial.UI.MethodController"):
      return <RPCPreloader />
    case state.matches("Initial.UI.Buy"):
      return (
        <BuyComponent
          applicationMeta={state.context.appMeta}
          showTransactionDetails={() => send("SHOW_TRANSACTION_DETAILS")}
          onApprove={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
          feeMin={state.context.rpcMessage?.params[0]?.maxFeePerGas}
          feeMax={state.context.rpcMessage?.params[0]?.maxPriorityFeePerGas}
          price={state.context.rpcMessage?.params[0].value}
        />
      )
    case state.matches("Initial.UI.Sell"):
      return (
        <SellComponent
          applicationMeta={state.context.appMeta}
          showTransactionDetails={() => send("SHOW_TRANSACTION_DETAILS")}
          onApprove={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data}
          fromAddress={state.context.rpcMessage?.params[0]}
        />
      )
    case state.matches("Initial.UI.WaitForSignature"):
    case state.matches("Initial.UI.SendTransaction"):
    case state.matches("Initial.UI.SignTypedData"):
      return <PostloaderComponent />
    case state.matches("Initial.UI.Success"):
      return (
        <SuccessComponent
          onClose={() => send("CLOSE")}
          method={state.context?.method}
          itemName={state.context.data?.meta?.name}
        />
      )
    case state.matches("Initial.UI.TransactionDetails"):
      return <DetailsComponent onClose={() => send("BACK")} />
    default:
      return <div>EmbedController default</div>
  }
}
