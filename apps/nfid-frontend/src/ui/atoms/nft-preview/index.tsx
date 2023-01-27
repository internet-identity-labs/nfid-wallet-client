import clsx from "clsx"
import { useAtom } from "jotai"
import React from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { IconCmpDots, transferModalAtom } from "@nfid-frontend/ui"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import ICPLogo from "frontend/assets/dfinity.svg"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import copyIcon from "./assets/copy.svg"
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
        "rounded-md w-full transition-all cursor-pointer overflow-visible p-[1px] relative",
        "bg-gray-50 hover:bg-white hover:shadow-[0_2px_15px_rgba(0,0,0,0.1)]",
      )}
    >
      <Link
        to={`${ProfileConstants.base}/${ProfileConstants.assets}/${props.tokenId}`}
        state={{ nft: props }}
      >
        <div
          className={clsx(
            "flex items-center justify-center",
            "absolute w-6 h-6 bg-white rounded-full right-2.5 top-[215px] md:top-[270px]",
            props.blockchain !== "ic" && "hidden",
          )}
        >
          <img src={ICPLogo} alt="logo" className="w-2/3" />
        </div>
        <img
          className={clsx(
            "rounded-[5px] w-full h-[245px] md:h-[300px] object-cover",
          )}
          src={props.assetPreview}
          alt={props.name}
        />
        <div className={clsx(`text-sm p-2.5 flex justify-between items-end`)}>
          <div>
            <div className={clsx(`font-bold`)}>{props.name}</div>
            <div className={clsx(`text-secondary truncate w-[190px] mt-1`)}>
              {props.collection.name}
            </div>
          </div>
          <div className="relative w-6" ref={ref}>
            <IconCmpDots
              className={clsx(
                "text-secondary cursor-pointer hover:text-black",
                "rotate-90",
              )}
              onClick={(e) => {
                e.preventDefault()
                setIsTooltipOpen(!isTooltipOpen)
              }}
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
