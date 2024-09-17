import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { TransferTemplate } from "./components/template"

export interface TransferModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive" | "swap"
  tokenType: "ft" | "nft"
  onTokenTypeChange: (isNFT: boolean) => void
  component: JSX.Element
}

export interface TransferVaultModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: "send" | "receive" | "swap"
  tokenType: "ft" | "nft"
  component: JSX.Element
}

export const TransferModal: FC<TransferModalProps> = ({
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  component,
}) => {
  return (
    <TransferTemplate onClickOutside={onClickOutside}>
      <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
        {direction}
      </div>
      {direction === "send" && !isSuccess && (
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

export const TransferVaultModal: FC<TransferVaultModalProps> = ({
  onClickOutside,
  direction,
  component,
}) => {
  return (
    <TransferTemplate onClickOutside={onClickOutside} className="!h-[530px]">
      <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
        {direction}
      </div>
      {component}
    </TransferTemplate>
  )
}