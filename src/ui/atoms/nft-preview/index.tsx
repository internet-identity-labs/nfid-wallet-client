import clsx from "clsx"
import React from "react"
import { FiCopy } from "react-icons/fi"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"

const NFTPreview = (props: UserNFTDetails) => {
  const copyToClipboard = React.useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      e.preventDefault()
      toast.info("NFT URL copied to clipboard", {
        toastId: `copied_nft_${props.tokenId}`,
      })
      navigator.clipboard.writeText(link(props.collection.id, props.index))
    },
    [props.collection.id, props.index, props.tokenId],
  )

  return (
    <div
      className={clsx(
        "rounded w-full h-[315px] bg-slate-100 hover:bg-inherit hover:shadow-md hover:shadow-slate-100 transition-all cursor-pointer",
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
          <FiCopy
            className={clsx(`hover:text-blue-500`)}
            size="18"
            onClick={copyToClipboard}
          />
        </div>
      </Link>
    </div>
  )
}

export default NFTPreview
