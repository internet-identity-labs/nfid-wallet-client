import clsx from "clsx"

import { Image } from "@nfid-frontend/ui"

import WalletIcon from "../../assets/wallet.svg"
import { NFT } from "../../types"

export type Application = {
  domain: string
  name: string
}

export const TransferSendNFTInfo = ({ nft }: { nft: NFT }) => {
  return (
    <div className="flex items-center space-x-6 h-[142px]">
      <Image
        src={nft.assetPreview}
        className="h-[134px] w-[134px] rounded-md object-cover"
        alt={nft.name}
      />
      <div className={clsx("text-xs space-y-2.5")}>
        <p className={clsx("text-black font-semibold")}>
          {nft.collection.name}
        </p>
        <p className={clsx("text-lg font-bold text-blue")}>{nft.name}</p>
        <p
          className={clsx(
            "font-semibold text-secondary",
            "flex items-center space-x-2",
          )}
        >
          <Image src={WalletIcon} alt="wallet" />
          <span>{nft.walletName}</span>
        </p>
      </div>
    </div>
  )
}
