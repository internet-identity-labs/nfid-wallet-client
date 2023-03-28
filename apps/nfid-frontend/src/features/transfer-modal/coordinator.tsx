import { useActor } from "@xstate/react"
import clsx from "clsx"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import React, { useCallback, useContext, useMemo } from "react"

import { BlurredLoader, Tabs } from "@nfid-frontend/ui"

import { ProfileContext } from "frontend/App"

import { TransferReceive } from "./components/receive"
import { TransferFT } from "./components/send-ft"
import { TransferNFT } from "./components/send-nft"
import { TransferSuccess } from "./components/success"
import { transferTabs } from "./constants"
import { TransferMachineActor } from "./machine"

export const TransferModalCoordinator = () => {
  const globalServices = useContext(ProfileContext)

  const [state, send] = useActor(
    (globalServices as { transferService: TransferMachineActor })
      .transferService,
  )

  React.useEffect(
    () =>
      console.log("TransferModalCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  const Component = useMemo(() => {
    switch (true) {
      case state.matches("SendMachine.SendFT"):
        return (
          <TransferFT
            selectedToken={state.context?.selectedFT}
            selectedReceiverWallet={state.context?.receiverWallet}
            selectedSourceWallet={state.context?.sourceWalletAddress}
            selectedSourceAccount={state.context?.sourceAccount}
            assignToken={(token) =>
              send({ type: "ASSIGN_SELECTED_FT", data: token })
            }
            assignSourceWallet={(value) =>
              send({ type: "ASSIGN_SOURCE_WALLET", data: value })
            }
            assignReceiverWallet={(value) =>
              send({ type: "ASSIGN_RECEIVER_WALLET", data: value })
            }
            assignAmount={(value) =>
              send({ type: "ASSIGN_AMOUNT", data: value })
            }
            assignFromAccount={(value) =>
              send({ type: "ASSIGN_SOURCE_ACCOUNT", data: value })
            }
            onSubmit={() => send({ type: "ON_SUBMIT" })}
          />
        )
      case state.matches("SendMachine.SendNFT"):
        return <TransferNFT />
      case state.matches("ReceiveMachine"):
        return (
          <TransferReceive
            assignSelectedToken={(token) =>
              send({ type: "ASSIGN_SELECTED_FT", data: token })
            }
            assignSourceWallet={(value) =>
              send({ type: "ASSIGN_SOURCE_WALLET", data: value })
            }
            selectedToken={state.context?.selectedFT}
            selectedSourceWallet={state.context?.sourceWalletAddress}
          />
        )
      case state.matches("Success"):
        return (
          <TransferSuccess
            transactionMessage={state.context.successMessage}
            onClose={() => send({ type: "HIDE" })}
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
    <div
      className={clsx([
        "transition ease-in-out delay-150 duration-300",
        "z-40 top-0 left-0 w-full h-screen",
        "fixed bg-opacity-75 bg-gray-600",
      ])}
      style={{ margin: 0 }}
      onClick={() => send("HIDE")}
    >
      <div
        className={clsx(
          "rounded-xl shadow-lg p-5 text-black",
          "z-20 bg-white absolute flex flex-col",
          "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          "w-[95%] sm:w-[420px] h-[510px]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
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
            secondValue="NFT"
            className="mb-6"
            onChange={onTokenTypeChange}
            defaultValue={state.context.tokenType === "nft"}
          />
        )}
        {Component}
      </div>
    </div>
  )
}
