/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"

import {
  Button,
  IconNftPlaceholder,
  IconNftPlaceholderDark,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { MarketplaceListingWithFormatting } from "../types"
import { useDarkTheme } from "frontend/hooks"
import { useLocation, useNavigate } from "react-router-dom"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

interface MarketplaceCardProps {
  listing: MarketplaceListingWithFormatting
  onBuy: (listingId: bigint) => void
  isViewOnlyMode: boolean
}

export const MarketplaceCard = ({
  listing,
  onBuy,
  isViewOnlyMode,
}: MarketplaceCardProps) => {
  const isDarkTheme = useDarkTheme()
  const navigate = useNavigate()
  const { search } = useLocation()

  return (
    <div
      onClick={() =>
        navigate({
          pathname: `${ProfileConstants.base}/${ProfileConstants.nfts}/${listing.collectionId}/${listing.tokenId}`,
          search,
        })
      }
      className={clsx(
        "rounded-[12px] bg-gray-50 dark:bg-zinc-800 cursor-pointer",
        "h-full flex flex-col pb-3 relative",
        !listing.isOwnListing &&
          "group hover:shadow-xl dark:hover:bg-zinc-700 hover:bg-white transition-all duration-300",
      )}
    >
      <div className="relative rounded-[12px] overflow-hidden basis-[100%] flex items-center justify-center min-h-[336px]">
        {listing.isOwnListing && !isViewOnlyMode && (
          <div
            className={clsx(
              "absolute top-[11px] left-[11px] bg-white dark:bg-zinc-900",
              "flex items-center text-xs font-semibold leading-4",
              "h-[25px] text-teal-600 py-[5px] px-1.5 rounded-[8px]",
            )}
          >
            Your listing
          </div>
        )}
        <ImageWithFallback
          alt={`${listing.collectionName} #${listing.tokenId}`}
          fallbackSrc={
            isDarkTheme ? IconNftPlaceholderDark : IconNftPlaceholder
          }
          src={listing.imageUrl ?? "#"}
          className="object-cover w-full aspect-square"
        />
      </div>
      <div className="px-[10px] pt-[10px] mt-auto">
        <p className="mb-[2px] text-black dark:text-white font-bold leading-[24px]">
          #{listing.tokenId.toString()}
        </p>
        <p className="text-gray-400 dark:text-zinc-400 leading-[20px]">
          {listing.collectionName}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1.5 px-[10px] relative z-[2]">
        <div
          className={clsx(
            "h-[25px] text-primaryButtonColor dark:text-teal-600 bg-teal-50 dark:bg-teal-100",
            "flex items-center text-sm font-bold leading-4 py-1 px-2 rounded-[8px]",
          )}
        >
          {listing.icpPriceFormatted}
        </div>
        <div className="text-xs text-secondary dark:text-zinc-500">
          {listing.usdPriceFormatted}
        </div>
        {!listing.isOwnListing && !isViewOnlyMode && (
          <Button
            className="ml-auto sm:hidden"
            isSmall
            onClick={(e) => {
              e.stopPropagation()
              onBuy(listing.id)
            }}
          >
            Buy now
          </Button>
        )}
      </div>
      {!listing.isOwnListing && !isViewOnlyMode && (
        <div
          className={clsx(
            "absolute bottom-[-45px] left-0 right-0 opacity-0 pt-[10px] pb-3 group-hover:opacity-100 px-[10px] z-[1]",
            "rounded-b-[12px] group-hover:shadow-xl dark:group-hover:bg-zinc-700 group-hover:bg-white transition-all duration-300",
            "hidden sm:block",
          )}
        >
          <Button
            isSmall
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onBuy(listing.id)
            }}
          >
            Buy now
          </Button>
        </div>
      )}
    </div>
  )
}
