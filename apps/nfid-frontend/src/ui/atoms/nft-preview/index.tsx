import clsx from "clsx"
import { useAtom } from "jotai"
import React from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { transferModalAtom } from "@nfid-frontend/ui"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import copyIcon from "./assets/copy.svg"
import moreIcon from "./assets/more.svg"
import transferIcon from "./assets/transfer.svg"

const NFTPreview = (props: UserNFTDetails) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))

  const copyToClipboard = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      toast.info("NFT URL copied to clipboard", {
        toastId: `copied_nft_${props.tokenId}`,
      })
      navigator.clipboard.writeText(link(props.collection.id, props.index))
    },
    [props.collection.id, props.index, props.tokenId],
  )

  const onTransferNFT = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setTransferModalState({
        ...transferModalState,
        isModalOpen: true,
        sendType: "nft",
        selectedNFT: [props.tokenId],
      })
    },
    [props.tokenId, setTransferModalState, transferModalState],
  )

  return (
    <div
      className={clsx(
        "rounded w-full transition-all cursor-pointer overflow-visible",
        "bg-gray-50 hover:bg-white hover:shadow-md hover:shadow-slate-100",
      )}
    >
      <Link
        to={`${ProfileConstants.base}/${ProfileConstants.assets}/${props.tokenId}`}
        state={{ nft: props }}
      >
        <img
          className={clsx("rounded w-full h-[245px] object-cover")}
          src={props.assetPreview}
          alt={props.name}
        />
        <div className={clsx(`text-sm p-4 flex justify-between`)}>
          <div className={clsx(``)}>
            <div className={clsx(`font-bold`)}>#{props.index}</div>
            <div
              className={clsx(`text-slate-400 font-light truncate w-[190px]`)}
            >
              {props.collection.name}
            </div>
          </div>
          <div className="relative w-6" ref={ref}>
            <img
              onClick={(e) => {
                e.preventDefault()
                setIsTooltipOpen(!isTooltipOpen)
              }}
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
              <div
                onClick={onTransferNFT}
                className={clsx(
                  "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                  "flex items-center space-x-2",
                )}
              >
                <img src={transferIcon} alt="" />
                <span>Transfer</span>
              </div>
              <div
                onClick={copyToClipboard}
                className={clsx(
                  "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                  "flex items-center space-x-2",
                )}
              >
                <img src={copyIcon} alt="" />
                <span> Copy link</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default NFTPreview
