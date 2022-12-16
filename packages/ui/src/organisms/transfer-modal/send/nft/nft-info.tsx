import clsx from "clsx"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { GetWalletName } from "frontend/ui/pages/new-profile/nfts/util"

import WalletIcon from "../../assets/wallet.svg"
import { NFT } from "../../types"

export const TransferSendNFTInfo = ({ nft }: { nft: NFT }) => {
  const { applicationsMeta } = useApplicationsMeta()

  return (
    <div className="flex items-center space-x-6 h-[142px]">
      <img
        src={nft.assetPreview}
        className="h-[134px] w-[134px] rounded-md object-cover"
        alt={nft.name}
      />
      <div className={clsx("text-xs space-y-2.5")}>
        <p className={clsx("text-black-base font-semibold")}>
          {nft.collection.name}
        </p>
        <p className={clsx("text-lg font-bold text-blue")}>{nft.name}</p>
        <p
          className={clsx(
            "font-semibold text-gray-400",
            "flex items-center space-x-2",
          )}
        >
          <img src={WalletIcon} alt="wallet" />
          <span>
            {GetWalletName(
              applicationsMeta ?? [],
              nft.account.domain,
              nft.account.accountId,
            )}
          </span>
        </p>
      </div>
    </div>
  )
}
