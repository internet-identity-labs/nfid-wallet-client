import { useActor } from "@xstate/react"
import { motion } from "framer-motion"
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
import { RedeemStake } from "./components/redeem-stake"
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

  const hideModal = useCallback(() => {
    send({ type: "ASSIGN_SELECTED_FT", data: "" })
    send({ type: "ASSIGN_SELECTED_NFT", data: "" })
    send({ type: "CHANGE_TOKEN_TYPE", data: "ft" })
    send({ type: "CHANGE_DIRECTION", data: null })
    send({ type: "HIDE" })
  }, [send])

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
          <motion.div
            key="send-ft-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <TransferFT
              preselectedTokenAddress={state.context.selectedFT}
              isVault={state.context.isOpenedFromVaults}
              preselectedAccountAddress={state.context.sourceWalletAddress}
              onClose={hideModal}
              hideZeroBalance={hideZeroBalance}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          </motion.div>
        )}
        {state.matches("SendMachine.SendNFT") && (
          <motion.div
            key="send-nft-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <TransferNFT
              preselectedNFTId={state.context.selectedNFTId}
              onClose={hideModal}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          </motion.div>
        )}
        {state.matches("SwapMachine") && (
          <motion.div
            key="swap-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <SwapFT
              preselectedSourceTokenAddress={state.context.selectedFT}
              onClose={hideModal}
              onError={setHasSwapError}
              hideZeroBalance={hideZeroBalance}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
            />
          </motion.div>
        )}
        {state.matches("ReceiveMachine") && (
          <motion.div
            key="receive-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <TransferReceive
              publicKey={publicKey}
              preselectedAccountAddress={state.context.sourceWalletAddress}
            />
          </motion.div>
        )}
        {state.matches("RedeemMachine") && (
          <motion.div
            key="redeem-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <RedeemStake onClose={hideModal} />
          </motion.div>
        )}
      </>
    ),
    [state, publicKey, hideZeroBalance, hideModal],
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
          onClickOutside={hideModal}
          isSuccess={state.matches("TransferSuccess")}
          direction={state.context.direction}
          component={Components}
          tokenType={state.context.tokenType}
          isOpen={!state.matches("Hidden")}
        />
      ) : (
        <TransferModal
          onClickOutside={hideModal}
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
