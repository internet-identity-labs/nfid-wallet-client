import clsx from "clsx"
import React from "react"

import { ToggleButton } from "../../../molecules/toggle-button"
import { IWallet, NFT } from "../types"
import { ITransferNFT, TransferModalSendNFT } from "./send-nft"
import {
  ITransferToken,
  TokenConfig,
  TransferModalSendToken,
} from "./send-token"

export type TokenType = "ft" | "nft"

interface ITransferModalSend {
  onTokenSubmit: (values: ITransferToken) => void
  onNFTSubmit: (values: ITransferNFT) => void
  toggleTokenType: () => void
  setSelectedNFTs: (nftIds: string[]) => void
  onSelectWallet: (walletId: string) => void
  selectedWalletId?: string
  selectedNFTIds: string[]
  tokenType: TokenType
  tokenConfig: TokenConfig
  wallets?: IWallet[]
  walletOptions: { label: string; value: string; afterLabel: string }[]
  nfts: NFT[]
  selectedNFTDetails?: NFT
}

export const TransferModalSend: React.FC<ITransferModalSend> = ({
  nfts,
  onNFTSubmit,
  onSelectWallet,
  onTokenSubmit,
  selectedNFTDetails,
  selectedNFTIds,
  selectedWalletId,
  setSelectedNFTs,
  toggleTokenType,
  tokenConfig,
  tokenType,
  walletOptions,
  wallets,
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
            onSelectWallet={onSelectWallet}
            selectedWalletId={selectedWalletId}
            walletOptions={walletOptions}
            tokenConfig={tokenConfig}
          />
        ) : (
          <TransferModalSendNFT
            setSelectedNFTs={setSelectedNFTs}
            selectedNFTIds={selectedNFTIds}
            selectedNFTDetails={selectedNFTDetails}
            walletOptions={walletOptions}
            onNFTSubmit={onNFTSubmit}
            nfts={nfts}
          />
        )}
      </div>
    </>
  )
}
