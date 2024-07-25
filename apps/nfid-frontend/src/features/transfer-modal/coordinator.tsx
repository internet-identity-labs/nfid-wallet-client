import { useActor } from "@xstate/react"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import React, { useCallback, useContext, useMemo } from "react"
import { toast } from "react-toastify"

import { BlurredLoader, Tabs } from "@nfid-frontend/ui"

import { ProfileContext } from "frontend/provider"

import { TransferReceive } from "./components/receive"
import { TransferFT } from "./components/send-ft"
import { TransferNFT } from "./components/send-nft"
import { ITransferSuccess, TransferSuccess } from "./components/success"
import { transferTabs } from "./constants"
import { TransferTemplate } from "./ui/template"

export const TransferModalCoordinator = () => {
  const globalServices = useContext(ProfileContext)

  const [state, send] = useActor(globalServices.transferService)

  React.useEffect(() => {
    if (state.context.error?.message?.length) {
      toast.error(state.context?.error.message, {
        toastId: "unexpectedTransferError",
      })

      setTimeout(() => {
        send({ type: "ASSIGN_ERROR", data: "" })
      }, 5000)
    }
  }, [send, state.context.error])

  const Component = useMemo(() => {
    switch (true) {
      case state.matches("SendMachine.SendFT"):
        return (
          <TransferFT
            isVault={state.context.isOpenedFromVaults}
            preselectedTokenCurrency={state.context.tokenCurrency}
            preselectedAccountAddress={state.context.sourceWalletAddress}
            preselectedTokenBlockchain={state.context.tokenBlockchain}
            preselectedTransferDestination={state.context.receiverWallet}
            onTransferPromise={(message: ITransferSuccess) =>
              send({ type: "ON_TRANSFER_PROMISE", data: message })
            }
          />
        )
      case state.matches("SendMachine.SendNFT"):
        return (
          <TransferNFT
            preselectedNFTId={state.context.selectedNFTId}
            onTransferPromise={(message: ITransferSuccess) =>
              send({ type: "ON_TRANSFER_PROMISE", data: message })
            }
          />
        )
      case state.matches("ReceiveMachine"):
        return (
          <TransferReceive
            isVault={state.context.isOpenedFromVaults}
            preselectedTokenStandard={state.context.tokenStandard}
            preselectedAccountAddress={state.context.sourceWalletAddress}
            preselectedTokenBlockchain={state.context.tokenBlockchain}
          />
        )
      case state.matches("Success"):
        return (
          <TransferSuccess
            onClose={() => send({ type: "HIDE" })}
            {...state.context.transferObject!}
          />
        )
      default:
        return <BlurredLoader overlayClassnames="z-10 rounded-xl" isLoading />
    }
  }, [send, state])

  const onModalTypeChange = useCallback(
    (value: string) => {
      // TODO: send receive
      return send({ type: "CHANGE_DIRECTION", data: value as any })
    },
    [send],
  )

  const onTokenTypeChange = useCallback(
    (isNFT: boolean) => {
      return send({ type: "CHANGE_TOKEN_TYPE", data: isNFT ? "nft" : "ft" })
    },
    [send],
  )

  if (state.matches("Hidden")) return null

  return (
    <TransferTemplate onClickOutside={() => send({ type: "HIDE" })}>
      {!state.matches("Success") && (
        <Tabs
          tabs={transferTabs}
          defaultValue={state.context.direction}
          onValueChange={onModalTypeChange}
          isFitLine={false}
        />
      )}
      {state.context.direction === "send" && !state.matches("Success") && (
        <ToggleButton
          firstValue="Token"
          secondValue="Collectible"
          className="mb-6"
          onChange={onTokenTypeChange}
          defaultValue={state.context.tokenType === "nft"}
          id="send_type_toggle"
        />
      )}
      {Component}
    </TransferTemplate>
  )
}
