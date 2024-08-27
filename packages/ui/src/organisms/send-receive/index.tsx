import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { Tabs } from "@nfid-frontend/ui"

import { TransferTemplate } from "./components/template"
import { transferTabs } from "./constants"

export interface SendReceiveModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive"
  tokenType: "ft" | "nft"
  onTokenTypeChange: (isNFT: boolean) => void
  onModalTypeChange: (value: string) => void
  component: JSX.Element
}

export const SendReceiveModal: FC<SendReceiveModalProps> = ({
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  onModalTypeChange,
  component,
}) => {
  console.log("dddd", direction)
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
