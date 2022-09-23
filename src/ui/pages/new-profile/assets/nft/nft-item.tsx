import clsx from "clsx"
import React from "react"
import { FiCopy } from "react-icons/fi"
import { toast } from "react-toastify"

import { link } from "frontend/integration/entrepot"
import { NFTDetails } from "frontend/integration/entrepot/types"

// No tooltip menu for now -  @Artem
// import useClickOutside from "frontend/ui/utils/use-click-outside"

interface IProfileAssetsNFTItem extends React.HTMLAttributes<HTMLDivElement> {
  nft: NFTDetails
}

export const ProfileAssetsNFTItem: React.FC<IProfileAssetsNFTItem> = ({
  nft,
}) => {
  // No tooltip menu for now -  @Artem
  // const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  // const ref = useClickOutside(() => setIsTooltipOpen(false))

  const copyToClipboard = React.useCallback(() => {
    toast.info("NFT URL copied to clipboard")
    navigator.clipboard.writeText(link(nft.collection.id, nft.index))
  }, [nft.collection.id, nft.index])

  return (
    <div
      className={clsx(
        "flex-col bg-gray-50 rounded-md transition-all",
        "hover:shadow-md hover:bg-white cursor-pointer",
        "p-[1px] sm:p-0.5",
      )}
    >
      <div
        style={{ backgroundImage: `url(${nft.assetPreview})` }}
        className="bg-center bg-contain h-[30vh] bg-no-repeat"
      />
      <div className="flex pl-5 pr-2.5 py-4">
        <div className="w-full text-sm">
          <p className="font-bold">{nft.name}</p>
          <p className="text-gray-400">{nft.collection.name}</p>
        </div>
        <div className="relative w-6">
          <div onClick={copyToClipboard}>
            <FiCopy className="transition-opacity cursor-pointer hover:opacity-40" />
          </div>
          {/* No tooltip menu for now - @Artem */}
          {/* <div
            className={clsx(
              "absolute top-6 right-0 w-[150px]",
              "bg-white rounded-md shadow-md",
              "text-sm",
              !isTooltipOpen && "hidden",
            )}
          >
            <p className="pl-[10px] leading-10 hover:bg-gray-100 rounded-md">
              Sell
            </p>
            <p className="pl-[10px] leading-10 hover:bg-gray-100 rounded-md">
              Transfer
            </p>
            <p className="pl-[10px] leading-10 hover:bg-gray-100 rounded-md">
              Copy link
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
