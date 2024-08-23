import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC, useCallback, useContext, useMemo } from "react"
import { toast } from "react-toastify"

import { BlurredLoader, Tabs } from "@nfid-frontend/ui"

import { TransferTemplate } from "./components/template"
import { transferTabs } from "./constants"

// import { TransferReceive } from "./components/receive"
// import { TransferFT } from "./components/send-ft"
// import { TransferNFT } from "./components/send-nft"
// import { ITransferSuccess, TransferSuccess } from "./components/success"
// import { TransferTemplate } from "./ui/template"
export interface SendReceiveModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive"
  tokenType: "ft" | "nft"
  onTokenTypeChange: (isNFT: boolean) => void
  onModalTypeChange: (value: string) => void
  component: JSX.Element
  //   componentType:
  //     | "transfet-ft"
  //     | "transfet-nft"
  //     | "transfet-receive"
  //     | "transfet-success"
  //     | "transfet-loader"
}

export const SendReceiveModal: FC<SendReceiveModalProps> = ({
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  onModalTypeChange,
  component,
  //componentType,
}) => {
  // const Component = useMemo(() => {
  //     switch (true) {
  //       case componentType === "transfet-ft":
  //         return (
  //           <TransferFT
  //             isVault={state.context.isOpenedFromVaults}
  //             preselectedTokenCurrency={state.context.tokenCurrency}
  //             preselectedAccountAddress={state.context.sourceWalletAddress}
  //             preselectedTokenBlockchain={state.context.tokenBlockchain}
  //             preselectedTransferDestination={state.context.receiverWallet}
  //             onTransferPromise={(message: ITransferSuccess) =>
  //               send({ type: "ON_TRANSFER_PROMISE", data: message })
  //             }
  //           />
  //         )
  //         case componentType === "transfet-nft":
  //         return (
  //           <TransferNFT
  //             preselectedNFTId={state.context.selectedNFTId}
  //             onTransferPromise={(message: ITransferSuccess) =>
  //               send({ type: "ON_TRANSFER_PROMISE", data: message })
  //             }
  //           />
  //         )
  //         case componentType === "transfet-receive":
  //         return (
  //           <TransferReceive
  //             isVault={state.context.isOpenedFromVaults}
  //             preselectedTokenStandard={state.context.tokenStandard}
  //             preselectedAccountAddress={state.context.sourceWalletAddress}
  //             preselectedTokenBlockchain={state.context.tokenBlockchain}
  //           />
  //         )
  //         case componentType === "transfet-success":
  //         return (
  //           <TransferSuccess
  //             onClose={() => send({ type: "HIDE" })}
  //             {...state.context.transferObject!}
  //           />
  //         )
  //         case componentType === "transfet-loader":
  //             return <BlurredLoader overlayClassnames="z-10 rounded-xl" isLoading />
  //       default:
  //         return <BlurredLoader overlayClassnames="z-10 rounded-xl" isLoading />
  //     }
  //   }, [send, state])
  return (
    <TransferTemplate onClickOutside={onClickOutside}>
      {!isSuccess && (
        <div className="mt-[10px]">
          <Tabs
            tabs={transferTabs}
            defaultValue={direction}
            onValueChange={onModalTypeChange}
            isFitLine={false}
          />
        </div>
      )}
      {direction === "send" && !isSuccess && (
        <ToggleButton
          firstValue="Token"
          secondValue="Collectible"
          className="mb-[14px]"
          onChange={onTokenTypeChange}
          defaultValue={tokenType === "nft"}
          id="send_type_toggle"
        />
      )}
      {component}
    </TransferTemplate>
  )
}
