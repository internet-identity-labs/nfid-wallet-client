import clsx from "clsx"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { ModalType, TokenType } from "frontend/features/transfer-modal/types"

import SettingsIcon from "./assets/swap-settings.svg"

import { Tooltip } from "../../molecules/tooltip"
import { TransferTemplate } from "./components/template"

export interface TransferModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: ModalType | null
  tokenType: TokenType
  onTokenTypeChange: (isNFT: boolean) => void
  component: JSX.Element
  isOpen: boolean
  hasSwapError: boolean
}

export interface TransferVaultModalProps {
  onClickOutside: () => void
  isSuccess: boolean
  direction: ModalType | null
  tokenType: TokenType
  component: JSX.Element
  isOpen: boolean
}

export const TransferModal: FC<TransferModalProps> = ({
  onClickOutside,
  isSuccess,
  direction,
  tokenType,
  onTokenTypeChange,
  component,
  isOpen,
  hasSwapError,
}) => {
  return (
    <TransferTemplate
      onClickOutside={onClickOutside}
      className={clsx(
        direction === ModalType.SEND && "!pb-5",
        hasSwapError ? "min-h-[540px]" : "min-h-[480px]",
      )}
      overlayClassName={!isOpen ? "hidden" : ""}
      isOpen={isOpen}
    >
      {!isSuccess && direction !== ModalType.SWAP && (
        <div
          className={clsx(
            "leading-10 text-[20px] font-bold mb-[18px]",
            "flex justify-between items-center",
          )}
        >
          <span className="first-letter:capitalize">{direction}</span>
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
  isOpen,
}) => {
  return (
    <TransferTemplate
      onClickOutside={onClickOutside}
      className={clsx("!h-[530px]")}
      overlayClassName={!isOpen ? "hidden" : ""}
      isOpen={isOpen}
    >
      {!isSuccess && (
        <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
          {direction}
        </div>
      )}
      {component}
    </TransferTemplate>
  )
}
