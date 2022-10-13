import { useCallback, useState } from "react"

import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { IWallet } from "frontend/integration/identity-manager/wallet/types"
import { ToggleButton } from "frontend/ui/molecules/toggle-button"

import { ITransferNFT, TransferModalSendNFT } from "./send-nft"
import { ITransferToken, TransferModalSendToken } from "./send-token"

interface ITransferModalSend {
  onTokenSubmit: (values: ITransferToken) => void
  onNFTSubmit: (values: ITransferNFT) => void
  wallets?: IWallet[]
  nfts: UserNFTDetails[]
}

export const TransferModalSend: React.FC<ITransferModalSend> = ({
  onTokenSubmit,
  onNFTSubmit,
  wallets,
  nfts,
}) => {
  const [sendType, setSendType] = useState<"nft" | "token">("nft")

  const onToggleSwitch = useCallback((value: boolean) => {
    if (value) setSendType("nft")
    else setSendType("token")
  }, [])

  return (
    <>
      <ToggleButton
        firstValue="Token"
        secondValue="NFT"
        onToggle={onToggleSwitch}
        className="mb-6"
      />
      {sendType === "token" && (
        <TransferModalSendToken
          onTokenSubmit={onTokenSubmit}
          wallets={wallets}
        />
      )}
      {sendType === "nft" && (
        <TransferModalSendNFT onNFTSubmit={onNFTSubmit} nfts={nfts} />
      )}
    </>
  )
}
