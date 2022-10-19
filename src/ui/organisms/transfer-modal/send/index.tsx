import clsx from "clsx"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

import { transferModalAtom } from "frontend/apps/identity-manager/profile/transfer-modal/state"
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
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const [isSendNFT, setIsSendNFT] = useState(false)

  useEffect(() => {
    if (transferModalState.sendType) {
      setIsSendNFT(transferModalState.sendType === "nft")
      setTransferModalState({ ...transferModalState, sendType: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ToggleButton
        firstValue="Token"
        secondValue="NFT"
        className="mb-6"
        value={isSendNFT}
        toggleValue={() => setIsSendNFT(!isSendNFT)}
      />
      <div
        className={clsx(
          !isSendNFT ? "flex flex-col justify-between flex-grow" : "hidden",
        )}
      >
        <TransferModalSendToken
          onTokenSubmit={onTokenSubmit}
          wallets={wallets}
        />
      </div>
      <div
        className={clsx(
          isSendNFT ? "flex flex-col justify-between flex-grow" : "hidden",
        )}
      >
        <TransferModalSendNFT
          wallets={wallets}
          onNFTSubmit={onNFTSubmit}
          nfts={nfts}
        />
      </div>
    </>
  )
}
