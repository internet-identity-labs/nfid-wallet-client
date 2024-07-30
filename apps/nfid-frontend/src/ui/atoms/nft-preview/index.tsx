import { useActor } from "@xstate/react"
import clsx from "clsx"
import React, { useCallback, useContext } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { trimConcat } from "src/ui/atoms/util/util"

import { IconCmpDots } from "@nfid-frontend/ui"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { ProfileContext } from "frontend/provider"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import copyIcon from "./assets/copy.svg"
import transferIcon from "./assets/transfer.svg"

const NFTPreview = (props: UserNonFungibleToken) => {
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))

  const copyToClipboard = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      toast.info("NFT URL copied to clipboard", {
        toastId: `copied_nft_${props.tokenId}`,
      })
      navigator.clipboard.writeText(props.clipboardText ?? "")
    },
    [props.clipboardText, props.tokenId],
  )

  const onTransferNFT = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: props.tokenId })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [props, send],
  )

  return (
    <div
      className={clsx(
        "rounded-md w-full transition-all cursor-pointer overflow-visible p-[1px]",
        "bg-gray-50 hover:bg-white hover:shadow-[0_2px_15px_rgba(0,0,0,0.1)] nft",
      )}
      id={
        trimConcat("nft_token_", props.name) +
        "_" +
        trimConcat("", props.collection.id)
      }
    >
      <Link
        className="relative flex flex-col items-end"
        to={`${ProfileConstants.base}/${ProfileConstants.collectibles}/${props.tokenId}`}
        state={{ nft: props }}
      >
        <div
          className={clsx(
            "flex items-center justify-center z-10 mr-2.5",
            "absolute w-6 h-6 bg-white rounded-full top-[215px] md:top-[267px]",
          )}
          id={
            trimConcat("nft_token_", props.name) +
            "_" +
            trimConcat("", props.collection.id)
          }
        >
          <img
            src={props.blockchainLogo}
            alt="logo"
            className={clsx(
              "w-2/3",
              props.blockchain !== "Internet Computer" && "!w-auto h-2/3",
            )}
          />
        </div>
        {["img", "image"].includes(props.assetPreview.format) && (
          <img
            id="asset-img"
            className={clsx(
              "rounded-[5px] w-full h-[245px] md:h-[300px] object-cover",
            )}
            src={props.assetPreview.url}
            alt={props.name}
          />
        )}
        {props.assetPreview.format === "video" && (
          <video
            id="asset-video"
            className={clsx(
              "rounded-[5px] w-full h-[245px] md:h-[300px] object-cover",
            )}
            src={props.assetPreview.url}
          />
        )}
        <div
          className={clsx(
            `text-sm p-2.5 flex justify-between items-center w-full`,
          )}
        >
          <div>
            <div
              className={clsx(`font-bold`)}
              id={
                trimConcat("nft_token_", props.name) +
                "_" +
                trimConcat("", props.collection.id)
              }
            >
              {props.name}
            </div>
            <div
              id={trimConcat("nft_collection_", props.collection.id)}
              className={clsx(`text-secondary truncate max-w-[190px] mt-1`)}
            >
              {props.collection.name}
            </div>
          </div>
          <div className="relative w-6 shrink-0" ref={ref}>
            <IconCmpDots
              className={clsx(
                "text-secondary cursor-pointer hover:text-black",
                "rotate-90 shrink-0",
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
                "text-sm z-10",
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
