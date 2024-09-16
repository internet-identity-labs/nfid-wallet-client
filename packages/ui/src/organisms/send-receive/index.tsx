import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { TabsSwitcher } from "@nfid-frontend/ui"

import { TransferTemplate } from "./components/template"
import { transferTabs } from "./constants"

export interface SendReceiveModalProps {
  isVault: boolean
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive" | "swap"
  tokenType: "ft" | "nft"
  onTokenTypeChange: (isNFT: boolean) => void
  onModalTypeChange: (value: string) => void
  component: JSX.Element
}

export const SendReceiveModal: FC<SendReceiveModalProps> = ({
  isVault,
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  onModalTypeChange,
  component,
}) => {
  return (
    <TransferTemplate onClickOutside={onClickOutside} isVault={isVault}>
      {!isSuccess && (
        <div>
          <TabsSwitcher
            tabs={transferTabs}
            activeTab={direction}
            setActiveTab={onModalTypeChange}
            isFitLine={false}
            className="mb-[14px]"
          />
        </div>
      )}
      {direction === "send" && !isSuccess && !isVault && (
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
