import { useActor } from "@xstate/react"
import {
  TransferModal,
  TransferVaultModal,
} from "packages/ui/src/organisms/send-receive"
import { getUserPrincipalId } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { BlurredLoader } from "@nfid-frontend/ui"

import { ProfileContext } from "frontend/provider"

import { TransferReceive } from "./components/receive"
import { TransferFT } from "./components/send-ft"
import { TransferNFT } from "./components/send-nft"
import { ITransferSuccess, TransferSuccess } from "./components/send-success"
import { SwapFT } from "./components/swap"

export const TransferModalCoordinator = () => {
  const [publicKey, setPublicKey] = useState("")
  const [isSwapSuccess, setIsSwapSuccess] = useState(false)
  const globalServices = useContext(ProfileContext)
  const [state, send] = useActor(globalServices.transferService)

  useEffect(() => {
    getUserPrincipalId().then((data) => {
      setPublicKey(data.publicKey)
    })
  }, [])

  useEffect(() => {
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
            preselectedTokenAddress={state.context.selectedFT}
            isVault={state.context.isOpenedFromVaults}
            preselectedAccountAddress={state.context.sourceWalletAddress}
            onTransfer={(message: ITransferSuccess) =>
              send({ type: "ON_TRANSFER", data: message })
            }
          />
        )
      case state.matches("SendMachine.SendNFT"):
        return (
          <TransferNFT
            preselectedNFTId={state.context.selectedNFTId}
            onTransfer={(message: ITransferSuccess) =>
              send({ type: "ON_TRANSFER", data: message })
            }
          />
        )
      case state.matches("SwapMachine"):
        return (
          <SwapFT
            onSuccessSwitched={setIsSwapSuccess}
            isSuccess={isSwapSuccess}
          />
        )
      case state.matches("ReceiveMachine"):
        return (
          <TransferReceive
            publicKey={publicKey}
            isVault={state.context.isOpenedFromVaults}
            preselectedAccountAddress={state.context.sourceWalletAddress}
          />
        )
      case state.matches("TransferSuccess"):
        return (
          <TransferSuccess
            onClose={() => send({ type: "HIDE" })}
            {...state.context.transferObject!}
          />
        )
      default:
        return <BlurredLoader overlayClassnames="z-10 rounded-xl" isLoading />
    }
  }, [send, state, publicKey, isSwapSuccess])

  const onTokenTypeChange = useCallback(
    (isNFT: boolean) => {
      return send({ type: "CHANGE_TOKEN_TYPE", data: isNFT ? "nft" : "ft" })
    },
    [send],
  )

  if (state.matches("Hidden")) return null

  return (
    <>
      {state.context.isOpenedFromVaults ? (
        <TransferVaultModal
          onClickOutside={() => send({ type: "HIDE" })}
          isSuccess={state.matches("TransferSuccess")}
          direction={state.context.direction}
          component={Component}
          tokenType={state.context.tokenType}
        />
      ) : (
        <TransferModal
          onClickOutside={() => send({ type: "HIDE" })}
          isSuccess={state.matches("TransferSuccess") || isSwapSuccess}
          direction={state.context.direction}
          tokenType={state.context.tokenType}
          onTokenTypeChange={onTokenTypeChange}
          component={Component}
        />
      )}
    </>
  )
}
