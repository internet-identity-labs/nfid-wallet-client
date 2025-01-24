import { useActor } from "@xstate/react"
import toaster from "packages/ui/src/atoms/toast"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import {
  TransferModal,
  TransferVaultModal,
} from "packages/ui/src/organisms/send-receive"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

import { authState } from "@nfid/integration"

import { userPrefService } from "frontend/integration/user-preferences/user-pref-service"
import { ProfileContext } from "frontend/provider"

import { TransferReceive } from "./components/receive"
import { TransferFT } from "./components/send-ft"
import { TransferNFT } from "./components/send-nft"
import { SwapFT } from "./components/swap"

export const TransferModalCoordinator = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | undefined>()
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const globalServices = useContext(ProfileContext)
  const [state, send] = useActor(globalServices.transferService)
  const [hasSwapError, setHasSwapError] = useState(false)

  useEffect(() => {
    userPrefService.getUserPreferences().then((userPref) => {
      setHideZeroBalance(userPref.isHideZeroBalance())
    })
  }, [])

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

  useEffect(() => {
    if (errorMessage) {
      if (state.matches("Hidden")) {
        toaster.error(errorMessage, {
          toastId: "error",
        })
      }
      return setErrorMessage(undefined)
    }

    if (successMessage) {
      if (state.matches("Hidden")) {
        toaster.success(successMessage, {
          toastId: "success",
        })
      }

      return setSuccessMessage(undefined)
    }
  }, [errorMessage, successMessage, state])

  const publicKey = authState.getUserIdData().publicKey

  const Components = useMemo(
    () => (
      <>
        {state.matches("SendMachine.SendFT") && (
          <TransferFT
            preselectedTokenAddress={state.context.selectedFT}
            isVault={state.context.isOpenedFromVaults}
            preselectedAccountAddress={state.context.sourceWalletAddress}
            onClose={() => send({ type: "HIDE" })}
            hideZeroBalance={hideZeroBalance}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        )}
        {state.matches("SendMachine.SendNFT") && (
          <TransferNFT
            preselectedNFTId={state.context.selectedNFTId}
            onClose={() => send({ type: "HIDE" })}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        )}
        {state.matches("SwapMachine") && (
          <SwapFT
            onClose={() => send({ type: "HIDE" })}
            onError={setHasSwapError}
            hideZeroBalance={hideZeroBalance}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        )}
        {state.matches("ReceiveMachine") && (
          <TransferReceive
            publicKey={publicKey}
            preselectedAccountAddress={state.context.sourceWalletAddress}
            isOpen={true}
          />
        )}
      </>
    ),
    [send, state, publicKey, hideZeroBalance],
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
