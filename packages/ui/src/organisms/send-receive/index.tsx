import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { ModalType, TokenType } from "frontend/features/transfer-modal/types"

import { TransferTemplate } from "./components/template"

export interface TransferModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: ModalType
  tokenType: TokenType
  onTokenTypeChange: (isNFT: boolean) => void
  component: JSX.Element
}

export interface TransferVaultModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: ModalType
  tokenType: TokenType
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
      {!isSuccess && (
        <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
          {direction}
        </div>
      )}
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
  isSuccess,
}) => {
  return (
    <TransferTemplate onClickOutside={onClickOutside} className="!h-[530px]">
      {!isSuccess && (
        <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
          {direction}
        </div>
      )}
      {component}
    </TransferTemplate>
  )
}
