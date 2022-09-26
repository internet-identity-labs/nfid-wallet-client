import clsx from "clsx"
import { FiCopy } from "react-icons/fi"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { NFTDetails } from "frontend/integration/entrepot/types"

const NFTPreview = (props: NFTDetails) => {
  return (
    <div
      className={clsx(
        "rounded w-[245px] h-[315px] bg-slate-100 hover:bg-inherit hover:shadow-md hover:shadow-slate-100 transition-all cursor-pointer",
      )}
    >
      <Link
        to={`${ProfileConstants.base}/${ProfileConstants.assets}/${props.tokenId}`}
      >
        <img
          className={clsx("rounded w-[245px] h-[245px] object-cover")}
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
            onClick={(e) => {
              e.preventDefault()
              toast.info("NFT URL copied to clipboard")
              navigator.clipboard.writeText(
                link(props.collection.id, props.index),
              )
            }}
          />
        </div>
      </Link>
    </div>
  )
}

export default NFTPreview
