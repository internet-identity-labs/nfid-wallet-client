/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { FC } from "react"

import {
  Button,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import SuccessIcon from "../assets/stake-success.svg?url"
import FailedIcon from "../assets/stake-failed.svg?url"
import SuccessImage from "../assets/nft-buy-success.png"
import { useNavigate } from "react-router-dom"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { MarketplaceType } from "packages/ui/src/organisms/marketplace/types"

export interface BuyNFTSuccessProps {
  title: string
  subTitle?: string
  onClose?: () => void
  assetImg?: string
  isOpen: boolean
  status: SendStatus
  error?: string
  isListing?: boolean
  price?: string
}

export const NFTMarketplaceSuccessUi: FC<BuyNFTSuccessProps> = ({
  title,
  subTitle = "0.00 USD",
  onClose,
  assetImg,
  isOpen,
  status,
  error,
  isListing = false,
  price,
}) => {
  const navigate = useNavigate()

  const onView = () => {
    onClose?.()
    isListing
      ? navigate(`${ProfileConstants.base}/${ProfileConstants.marketplace}`, {
          state: { tab: MarketplaceType.MyListings },
        })
      : navigate(`${ProfileConstants.base}/${ProfileConstants.nfts}`)
  }

  return (
    <div
      id={"success_window_3"}
      className={clsx(
        "text-black dark:text-white text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-col justify-between items-center bg-white dark:bg-darkGray",
        !isOpen && "hidden",
      )}
    >
      <div className={clsx("text-center")}>
        <div className="mt-5 text-xl !font-bold leading-6 dark:text-white">
          {status === SendStatus.FAILED
            ? `${isListing ? "Listing" : "Purchase"} failed`
            : status === SendStatus.COMPLETED
              ? `${isListing ? "Listed for sale" : "Purchase completed"}`
              : `${isListing ? "Listing..." : "Buying..."}`}
        </div>
        <p className="h-5 mt-3 text-sm leading-5">
          {status === SendStatus.COMPLETED && (
            <>
              {isListing ? (
                <>
                  Your NFT is listed for {price} ICP.
                  <br />
                  It stays in your wallet until someone buys it.
                </>
              ) : (
                "This NFT is now in your wallet."
              )}
            </>
          )}
        </p>
      </div>
      <div className="relative z-20 w-full px-4">
        <div
          className="py-[35px] mt-[65px] w-full"
          style={
            status === SendStatus.COMPLETED
              ? {
                  backgroundImage: `url(${SuccessImage})`,
                  backgroundSize: "100% auto",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="relative w-[124px] mx-auto">
            {status !== SendStatus.PENDING && (
              <div
                className={clsx(
                  "w-[32px] h-[32px] rounded-full border border-3 border-white",
                  status === SendStatus.COMPLETED
                    ? "bg-primaryButtonColor"
                    : "bg-red-600",
                  "absolute top-[-12px] right-[-12px] flex items-center justify-center",
                )}
              >
                <img
                  className="w-5"
                  src={
                    status === SendStatus.COMPLETED ? SuccessIcon : FailedIcon
                  }
                  alt={
                    status === SendStatus.COMPLETED
                      ? "Stake success"
                      : "Stake failed"
                  }
                />
              </div>
            )}
            <ImageWithFallback
              alt={`${subTitle} #${title}`}
              fallbackSrc={IconNftPlaceholder}
              src={assetImg}
              className={clsx(
                "h-[124px] w-full border border-4 border-white shadow-lg",
                "object-cover rounded-[12px] bg-white",
              )}
            />
          </div>
        </div>
      </div>
      <p className="text-sm leading-[25px] font-inter" id="title">
        {title}
      </p>
      <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
        {subTitle}
      </p>

      <div className="w-full mt-auto">
        {error && <div className="mb-5 text-sm text-red-600">{error}</div>}
        {status === SendStatus.PENDING ? (
          <Button type="primary" className="w-full" disabled>
            Confirming…
          </Button>
        ) : (
          <>
            {status !== SendStatus.FAILED && (
              <Button type="primary" className="w-full mb-2.5" onClick={onView}>
                {isListing ? "Go to My listings" : "View in wallet"}
              </Button>
            )}
            <Button
              type={status !== SendStatus.FAILED ? "ghost" : "primary"}
              className="w-full"
              onClick={onClose}
            >
              {isListing ? "Done" : "Keep browsing"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
