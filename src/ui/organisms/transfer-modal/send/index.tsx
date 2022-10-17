import clsx from "clsx"
import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"

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
  const [sendType, setSendType] = useState<"nft" | "token">("token")

  const onToggleSwitch = useCallback((value: boolean) => {
    if (value) setSendType("nft")
    else setSendType("token")
  }, [])

  useEffect(() => {
    if (transferModalState.sendType?.length) {
      setSendType(transferModalState.sendType)
      setTransferModalState({ ...transferModalState, sendType: "nft" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ToggleButton
        firstValue="Token"
        secondValue="NFT"
        initialChecked={sendType === "token"}
        onToggle={onToggleSwitch}
        className="mb-6"
      />
      <div className={clsx(sendType === "token" ? "" : "hidden")}>
        <TransferModalSendToken
          onTokenSubmit={onTokenSubmit}
          wallets={wallets}
        />
      </div>
      <div className={clsx(sendType === "nft" ? "" : "hidden")}>
        <TransferModalSendNFT onNFTSubmit={onNFTSubmit} nfts={nfts} />
      </div>
    </>
  )
}
