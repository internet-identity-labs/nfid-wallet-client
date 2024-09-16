import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { TransferTemplate } from "./components/template"

export interface TransferModalProps {
  isVault: boolean
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive" | "swap"
  tokenType: "ft" | "nft"
  onTokenTypeChange: (isNFT: boolean) => void
  component: JSX.Element
}

export const TransferModal: FC<TransferModalProps> = ({
  isVault,
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  component,
}) => {
  return (
    <TransferTemplate onClickOutside={onClickOutside} isVault={isVault}>
      {!isSuccess && <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
        {direction}
      </div>}
      {direction === "send" && !isSuccess && !isVault && (
        <ToggleButton
          firstValue="Token"
          secondValue="Collectible"
          className="mb-5"
          onChange={onTokenTypeChange}
          defaultValue={tokenType === "nft"}
          id="send_type_toggle"
        />
      )}
      {component}
    </TransferTemplate>
  )
}
