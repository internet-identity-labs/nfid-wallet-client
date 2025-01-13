import { useActor } from "@xstate/react"
import toaster from "packages/ui/src/atoms/toast"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import {
  TransferModal,
  TransferVaultModal,
} from "packages/ui/src/organisms/send-receive"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

import { authState } from "@nfid/integration"

import { ProfileContext } from "frontend/provider"

import { TransferReceive } from "./components/receive"
import { TransferFT } from "./components/send-ft"
import { TransferNFT } from "./components/send-nft"
import { SwapFT } from "./components/swap"

export const TransferModalCoordinator = () => {
  const globalServices = useContext(ProfileContext)
  const [state, send] = useActor(globalServices.transferService)
  const [hasSwapError, setHasSwapError] = useState(false)

  useDisableScroll(!state.matches("Hidden"))

  useEffect(() => {
    if (state.context.error?.message?.length) {
      toaster.error(state.context?.error.message, {
        toastId: "unexpectedTransferError",
      })

      setTimeout(() => {
        send({ type: "ASSIGN_ERROR", data: "" })
      }, 5000)
    }
  }, [send, state.context.error])

  const publicKey = authState.getUserIdData().publicKey

  const Components = useMemo(
    () => (
      <>
        <TransferFT
          preselectedTokenAddress={state.context.selectedFT}
          isVault={state.context.isOpenedFromVaults}
          preselectedAccountAddress={state.context.sourceWalletAddress}
          onClose={() => send({ type: "HIDE" })}
          isOpen={state.matches("SendMachine.SendFT")}
        />
        <TransferNFT
          preselectedNFTId={state.context.selectedNFTId}
          onClose={() => send({ type: "HIDE" })}
          isOpen={state.matches("SendMachine.SendNFT")}
        />
        <SwapFT
          onClose={() => send({ type: "HIDE" })}
          isOpen={state.matches("SwapMachine")}
          onError={setHasSwapError}
        />
        <TransferReceive
          publicKey={publicKey}
          preselectedAccountAddress={state.context.sourceWalletAddress}
          isOpen={state.matches("ReceiveMachine")}
        />
      </>
    ),
    [send, state, publicKey],
  )

  const onTokenTypeChange = useCallback(
    (isNFT: boolean) => {
      return send({ type: "CHANGE_TOKEN_TYPE", data: isNFT ? "nft" : "ft" })
    },
    [send],
  )

  return (
    <>
      {state.context.isOpenedFromVaults ? (
        <TransferVaultModal
          onClickOutside={() => send({ type: "HIDE" })}
          isSuccess={state.matches("TransferSuccess")}
          direction={state.context.direction}
          component={Components}
          tokenType={state.context.tokenType}
          isOpen={!state.matches("Hidden")}
        />
      ) : (
        <TransferModal
          onClickOutside={() => send({ type: "HIDE" })}
          isSuccess={state.matches("TransferSuccess")}
          direction={state.context.direction}
          tokenType={state.context.tokenType}
          onTokenTypeChange={onTokenTypeChange}
          component={Components}
          isOpen={!state.matches("Hidden")}
          hasSwapError={hasSwapError}
        />
      )}
    </>
  )
}
