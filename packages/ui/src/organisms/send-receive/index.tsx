import clsx from "clsx"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"
import { FC } from "react"

import { ModalType, TokenType } from "frontend/features/transfer-modal/types"

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
  hasBtcError: boolean
  isConvertSuccess: boolean
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
  hasBtcError,
  isConvertSuccess,
}) => {
  return (
    <TransferTemplate
      onClickOutside={onClickOutside}
      className={clsx(
        direction === ModalType.SEND && "!pb-5",
        hasSwapError
          ? "min-h-[540px]"
          : isConvertSuccess
          ? "min-h-[580px]"
          : hasBtcError
          ? "min-h-[520px]"
          : "min-h-[480px]",
      )}
      overlayClassName={!isOpen ? "hidden" : ""}
      isOpen={isOpen}
    >
      {direction === "send" && !isSuccess && (
        <>
          <div
            className={clsx(
              "leading-10 text-[20px] font-bold mb-[18px]",
              "flex justify-between items-center",
            )}
          >
            Send
          </div>
          <ToggleButton
            firstValue="Token"
            secondValue="NFT"
            className="mb-5"
            onChange={onTokenTypeChange}
            defaultValue={tokenType === "nft"}
            id="send_type_toggle"
          />
        </>
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
