import clsx from "clsx"
import React, { useEffect, useState } from "react"

import { TransferModalReceive } from "./receive"
import { TokenType, TransferModalSend } from "./send"
import { ITransferNFT } from "./send/send-nft"
import { ITransferToken } from "./send/send-token"
import { TransferModalSuccess } from "./sucess"
import { TransferModalTabs } from "./tabs"
import { IWallet, NFT } from "./types"

interface ITransferModal {
  transactionRoute: string
  wallets: IWallet[] | undefined
  successMessage: string
  tokenType: TokenType
  toggleTokenType: () => void
  onTokenSubmit: (values: ITransferToken) => void
  onNFTSubmit: (values: ITransferNFT) => void
  onClose: () => void
  nfts: NFT[]
}

export type modalTypes = "Send" | "Receive" | "Success" | string

export const TransferModal: React.FC<ITransferModal> = ({
  transactionRoute,
  successMessage,
  wallets,
  toggleTokenType,
  onTokenSubmit,
  onNFTSubmit,
  onClose,
  tokenType,
  nfts,
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
          toggleTokenType={toggleTokenType}
          nfts={nfts}
          wallets={wallets}
          onTokenSubmit={onTokenSubmit}
          onNFTSubmit={onNFTSubmit}
        />
      </div>

      {modalType === "Receive" && <TransferModalReceive wallets={wallets} />}
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
