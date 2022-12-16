import clsx from "clsx"
import React from "react"

import { ToggleButton } from "../../../molecules/toggle-button"
import { IWallet, NFT } from "../types"
import { ITransferNFT, TransferModalSendNFT } from "./send-nft"
import { ITransferToken, TransferModalSendToken } from "./send-token"

export type TokenType = "ft" | "nft"

interface ITransferModalSend {
  onTokenSubmit: (values: ITransferToken) => void
  onNFTSubmit: (values: ITransferNFT) => void
  toggleTokenType: () => void
  setSelectedNFTs: (nftIds: string[]) => void
  selectedNFTIds: string[]
  tokenType: TokenType
  wallets?: IWallet[]
  nfts: NFT[]
  selectedNFTDetails?: NFT
}

export const TransferModalSend: React.FC<ITransferModalSend> = ({
  toggleTokenType,
  onTokenSubmit,
  onNFTSubmit,
  setSelectedNFTs,
  selectedNFTIds,
  wallets,
  nfts,
  tokenType,
  selectedNFTDetails,
}) => {
  return (
    <>
      <ToggleButton
        firstValue="Token"
        secondValue="NFT"
        className="mb-6"
        value={tokenType === "nft"}
        toggleValue={toggleTokenType}
      />
      <div className={clsx("flex flex-col justify-between flex-grow")}>
        {tokenType === "ft" ? (
          <TransferModalSendToken
            onTokenSubmit={onTokenSubmit}
            wallets={wallets}
          />
        ) : (
          <TransferModalSendNFT
            setSelectedNFTs={setSelectedNFTs}
            selectedNFTIds={selectedNFTIds}
            selectedNFTDetails={selectedNFTDetails}
            wallets={wallets}
            onNFTSubmit={onNFTSubmit}
            nfts={nfts}
          />
        )}
      </div>
    </>
  )
}
