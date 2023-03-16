import { useActor } from "@xstate/react"
import React from "react"

import { BuyComponent } from "./components/buy"
import { DeployComponent } from "./components/deploy-collection"
import { DetailsComponent } from "./components/details"
import { DefaultSendTransaction } from "./components/fallbacks/sendTransaction"
import { DefaultSign } from "./components/fallbacks/signTypedData"
import { LazyMintComponent } from "./components/lazy-mint"
import { MintComponent } from "./components/mint"
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
      console.debug("EmbedControllerCoordinator", {
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
          data={state.context.data?.data}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
          feeMin={state.context.rpcMessage?.params[0]?.maxFeePerGas}
          feeMax={state.context.rpcMessage?.params[0]?.maxPriorityFeePerGas}
          price={state.context.rpcMessage?.params[0].value}
          isButtonDisabled={state.matches("Initial.PrepareSignature.Prepare")}
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
    case state.matches("Initial.UI.DeployCollection"):
      return (
        <DeployComponent
          applicationMeta={state.context.appMeta}
          showTransactionDetails={() => send("SHOW_TRANSACTION_DETAILS")}
          onApprove={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data?.data}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
          feeMin={state.context.rpcMessage?.params[0]?.maxFeePerGas}
          feeMax={state.context.rpcMessage?.params[0]?.maxPriorityFeePerGas}
          isButtonDisabled={state.matches("Initial.PrepareSignature.Prepare")}
        />
      )
    case state.matches("Initial.UI.Mint"):
      return (
        <MintComponent
          applicationMeta={state.context.appMeta}
          showTransactionDetails={() => send("SHOW_TRANSACTION_DETAILS")}
          onApprove={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data?.data}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
          feeMin={state.context.rpcMessage?.params[0]?.maxFeePerGas}
          feeMax={state.context.rpcMessage?.params[0]?.maxPriorityFeePerGas}
          price={state.context.rpcMessage?.params[0].value}
          isButtonDisabled={state.matches("Initial.PrepareSignature.Prepare")}
        />
      )
    case state.matches("Initial.UI.LazyMint"):
      return (
        <LazyMintComponent
          applicationMeta={state.context.appMeta}
          onSign={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data}
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
          itemName={state.context.data?.data?.meta?.name}
        />
      )
    case state.matches("Initial.UI.TransactionDetails"):
      return <DetailsComponent onClose={() => send("BACK")} />
    case state.matches("Initial.UI.DefaultSign"):
      return (
        <DefaultSign
          data={state.context.rpcMessage?.params[1]}
          onCancel={() => send("CANCEL")}
          onSign={() => send({ type: "SIGN" })}
        />
      )
    case state.matches("Initial.UI.DefaultSendTransaction"):
      return (
        <DefaultSendTransaction
          applicationMeta={state.context.appMeta}
          showTransactionDetails={() => send("SHOW_TRANSACTION_DETAILS")}
          onApprove={() => send({ type: "SIGN" })}
          onCancel={() => send("CANCEL")}
          data={state.context.data?.data}
          fromAddress={state.context.rpcMessage?.params[0].from}
          toAddress={state.context.rpcMessage?.params[0].to}
          feeMin={state.context.rpcMessage?.params[0]?.maxFeePerGas}
          feeMax={state.context.rpcMessage?.params[0]?.maxPriorityFeePerGas}
          price={state.context.rpcMessage?.params[0].value}
          isButtonDisabled={state.matches("Initial.PrepareSignature.Prepare")}
        />
      )
    default:
      return <div>EmbedController default</div>
  }
}
