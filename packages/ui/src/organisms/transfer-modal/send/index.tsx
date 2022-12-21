import clsx from "clsx"
import React from "react"

import { ToggleButton } from "../../../molecules/toggle-button"
import { TokenOption } from "../../select-token/select-token-menu"
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
  onSelectToken: (tokenValue: string) => void
  selectedToken: TokenOption
  selectedWalletId?: string
  selectedNFTIds: string[]
  tokenOptions: TokenOption[]
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
  onSelectToken,
  onSelectWallet,
  onTokenSubmit,
  selectedNFTDetails,
  selectedNFTIds,
  selectedToken,
  selectedWalletId,
  setSelectedNFTs,
  toggleTokenType,
  tokenConfig,
  tokenOptions,
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
            onSelectToken={onSelectToken}
            selectedWalletId={selectedWalletId}
            walletOptions={walletOptions}
            tokenConfig={tokenConfig}
            tokenOptions={tokenOptions}
            selectedToken={selectedToken}
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
