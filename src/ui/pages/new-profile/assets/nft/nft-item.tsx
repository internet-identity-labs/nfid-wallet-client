import clsx from "clsx"
import React from "react"

import { INFT } from "frontend/types/nft"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import moreIcon from "./assets/more.svg"

interface IProfileAssetsNFTItem extends React.HTMLAttributes<HTMLDivElement> {
  nft: INFT
}

export const ProfileAssetsNFTItem: React.FC<IProfileAssetsNFTItem> = ({
  nft,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))
  return (
    <div
      className={clsx(
        "flex-col bg-gray-50 rounded-md transition-all",
        "hover:shadow-md hover:bg-white cursor-pointer",
        "p-[1px] sm:p-0.5",
      )}
    >
      <img src={nft.imageUrl} alt="nft" />
      <div className="flex pl-5 pr-2.5 py-4">
        <div className="w-full text-sm">
          <p className="font-bold">Solo Sensei #2969</p>
          <p className="text-gray-400">Degenerate Ape Academy</p>
        </div>
        <div className="relative w-6" ref={ref}>
          <img
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            className="transition-opacity cursor-pointer hover:opacity-40"
            src={moreIcon}
            alt="more"
          />
          <div
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
          </div>
        </div>
      </div>
    </div>
  )
}
