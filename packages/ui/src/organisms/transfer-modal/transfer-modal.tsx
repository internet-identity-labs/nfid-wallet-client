import clsx from "clsx"
import React, { useEffect } from "react"

import { TokenOption } from "../select-token/select-token-menu"
import { TransferModalReceive } from "./receive"
import { TokenType, TransferModalSend } from "./send"
import { ITransferNFT } from "./send/send-nft"
import { ITransferToken, TokenConfig } from "./send/send-token"
import { TransferModalSuccess } from "./sucess"
import { TransferModalTabs } from "./tabs"
import { IWallet, NFT } from "./types"

export type modalTypes = "Send" | "Receive" | "Success" | string

interface ITransferModal {
  nfts: NFT[]
  onClose: () => void
  onNFTSubmit: (values: ITransferNFT) => void
  onSelectToken: (tokenValue: string) => void
  onSelectWallet: (walletId: string) => void
  onTokenSubmit: (values: ITransferToken) => void
  selectedNFTDetails?: NFT
  selectedNFTIds: string[]
  selectedToken: TokenOption
  selectedWalletId?: string
  setSelectedNFTs: (nftIds: string[]) => void
  successMessage: string
  toggleTokenType: () => void
  tokenConfig: TokenConfig
  tokenOptions: TokenOption[]
  tokenType: TokenType
  transactionRoute: string
  walletOptions: { label: string; value: string; afterLabel: string }[]
  wallets?: IWallet[]
  modalType: modalTypes
  setModalType: (value: modalTypes) => void
}

export const TransferModal: React.FC<ITransferModal> = ({
  nfts,
  onClose,
  onNFTSubmit,
  onSelectToken,
  onSelectWallet,
  onTokenSubmit,
  selectedNFTDetails,
  selectedNFTIds,
  selectedToken,
  selectedWalletId,
  setSelectedNFTs,
  successMessage,
  toggleTokenType,
  tokenConfig,
  tokenOptions,
  tokenType,
  transactionRoute,
  walletOptions,
  wallets,
  modalType,
  setModalType,
}) => {
  useEffect(() => {
    if (successMessage?.length) setModalType("Success")
  }, [setModalType, successMessage])

  return (
    <div
      className={clsx(
        "rounded-xl shadow-lg p-5 text-secondary",
        "z-20 bg-white absolute flex flex-col",
        "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
        "w-[95%] sm:w-[420px] h-[510px]",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {modalType !== "Success" && (
        <TransferModalTabs
          activeTab={modalType}
          setActiveTab={(value) => setModalType(value)}
        />
      )}

      <div
        className={clsx(
          modalType === "Send"
            ? "flex flex-col justify-between flex-grow"
            : "hidden",
        )}
      >
        <TransferModalSend
          nfts={nfts}
          onNFTSubmit={onNFTSubmit}
          onSelectToken={onSelectToken}
          onSelectWallet={onSelectWallet}
          onTokenSubmit={onTokenSubmit}
          selectedNFTDetails={selectedNFTDetails}
          selectedNFTIds={selectedNFTIds}
          selectedToken={selectedToken}
          selectedWalletId={selectedWalletId}
          setSelectedNFTs={setSelectedNFTs}
          toggleTokenType={toggleTokenType}
          tokenConfig={tokenConfig}
          tokenOptions={tokenOptions}
          tokenType={tokenType}
          walletOptions={walletOptions}
          wallets={wallets}
        />
      </div>

      {modalType === "Receive" && (
        <TransferModalReceive wallets={wallets} walletOptions={walletOptions} />
      )}
      {modalType === "Success" && (
        <TransferModalSuccess
          transactionRoute={transactionRoute}
          transactionMessage={successMessage}
          onClose={onClose}
        />
      )}
    </div>
  )
}
