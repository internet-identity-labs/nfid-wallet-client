import clsx from "clsx"
import { useState } from "react"
import React from "react"

import { ToggleButton } from "frontend/ui/molecules/toggle-button"

import { IWallet, NFT } from "../types"
import { ITransferNFT, TransferModalSendNFT } from "./send-nft"
import { ITransferToken, TransferModalSendToken } from "./send-token"

export type TokenType = "ft" | "nft"

interface ITransferModalSend {
  onTokenSubmit: (values: ITransferToken) => void
  onNFTSubmit: (values: ITransferNFT) => void
  toggleTokenType: () => void
  tokenType: TokenType
  wallets?: IWallet[]
  nfts: NFT[]
}

export const TransferModalSend: React.FC<ITransferModalSend> = ({
  toggleTokenType,
  onTokenSubmit,
  onNFTSubmit,
  wallets,
  nfts,
  tokenType,
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
            wallets={wallets}
            onNFTSubmit={onNFTSubmit}
            nfts={nfts}
          />
        )}
      </div>
    </>
  )
}
