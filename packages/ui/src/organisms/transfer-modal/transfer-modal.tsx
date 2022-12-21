import clsx from "clsx"
import React, { useEffect, useState } from "react"

import { TransferModalReceive } from "./receive"
import { TokenType, TransferModalSend } from "./send"
import { ITransferNFT } from "./send/send-nft"
import { ITransferToken, TokenConfig } from "./send/send-token"
import { TransferModalSuccess } from "./sucess"
import { TransferModalTabs } from "./tabs"
import { IWallet, NFT } from "./types"

interface ITransferModal {
  nfts: NFT[]
  onClose: () => void
  onNFTSubmit: (values: ITransferNFT) => void
  onSelectWallet: (walletId: string) => void
  onTokenSubmit: (values: ITransferToken) => void
  selectedNFTDetails?: NFT
  selectedNFTIds: string[]
  selectedWalletId?: string
  setSelectedNFTs: (nftIds: string[]) => void
  successMessage: string
  toggleTokenType: () => void
  tokenConfig: TokenConfig
  tokenType: TokenType
  transactionRoute: string
  walletOptions: { label: string; value: string; afterLabel: string }[]
  wallets?: IWallet[]
}

export type modalTypes = "Send" | "Receive" | "Success" | string

export const TransferModal: React.FC<ITransferModal> = ({
  nfts,
  onClose,
  onNFTSubmit,
  onSelectWallet,
  onTokenSubmit,
  selectedNFTDetails,
  selectedNFTIds,
  selectedWalletId,
  setSelectedNFTs,
  successMessage,
  toggleTokenType,
  tokenType,
  tokenConfig,
  transactionRoute,
  walletOptions,
  wallets,
}) => {
  const [modalType, setModalType] = useState<modalTypes>("Send")

  useEffect(() => {
    if (successMessage?.length) setModalType("Success")
  }, [successMessage])

  return (
    <div
      className={clsx(
        "rounded-xl shadow-lg p-5 text-gray-400",
        "z-20 bg-white absolute flex flex-col",
        "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
        "w-[95%] sm:w-[420px] h-[510px]",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {modalType !== "Success" && (
        <TransferModalTabs activeTab={modalType} setActiveTab={setModalType} />
      )}

      <div
        className={clsx(
          modalType === "Send"
            ? "flex flex-col justify-between flex-grow"
            : "hidden",
        )}
      >
        <TransferModalSend
          tokenType={tokenType}
          tokenConfig={tokenConfig}
          toggleTokenType={toggleTokenType}
          nfts={nfts}
          wallets={wallets}
          walletOptions={walletOptions}
          onTokenSubmit={onTokenSubmit}
          onNFTSubmit={onNFTSubmit}
          setSelectedNFTs={setSelectedNFTs}
          selectedNFTIds={selectedNFTIds}
          selectedNFTDetails={selectedNFTDetails}
          onSelectWallet={onSelectWallet}
          selectedWalletId={selectedWalletId}
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
