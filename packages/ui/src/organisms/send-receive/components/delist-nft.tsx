/* eslint-disable @nx/enforce-module-boundaries */
import { motion } from "framer-motion"
import { FC, useState } from "react"

import {
  BlurredLoader,
  Button,
  IconCmpInfo,
  IconCmpWarning,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

import clsx from "clsx"
import {
  BuyQuoteWithFormatting,
  MarketplaceListingWithFormatting,
} from "../../marketplace/types"
import {
  E8S,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { Spinner } from "packages/ui/src/atoms/spinner"

export interface DelistNFTUiProps {
  isLoading: boolean
  onClose: () => void
  onDelist: () => Promise<void>
  listing: MarketplaceListingWithFormatting | undefined
  icpToken: FT | undefined
  buyQuote: BuyQuoteWithFormatting | undefined
}

export const DelistNFTUi: FC<DelistNFTUiProps> = ({
  isLoading,
  onClose,
  onDelist,
  listing,
  icpToken,
  buyQuote,
}) => {
  const [isDelisting, setIsDelisting] = useState(false)

  if (isLoading || !listing || !icpToken || !buyQuote)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage="Fetching listed NFT"
        className="text-xs"
      />
    )

  const hasEnoughBalance =
    (icpToken.getTokenBalance() ?? BigInt(0)) >= buyQuote.ledgerFeeE8s

  const delist = async () => {
    setIsDelisting(true)
    await onDelist()
    setIsDelisting(false)
    onClose()
  }

  return (
    <>
      <motion.div
        key="formModal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className="leading-10 text-[20px] font-bold">Delist this NFT?</div>
        <div
          className={clsx(
            "h-[98px] bg-gray-50 dark:bg-zinc-700 rounded-[12px] mb-2.5 mt-[18px]",
            "pl-[3px] pt-[3px] pb-[3px] pr-2.5 flex items-center gap-2.5",
          )}
        >
          <ImageWithFallback
            alt={`${listing.collectionName} #${listing.tokenId}`}
            fallbackSrc={IconNftPlaceholder}
            src={listing.imageUrl ?? "#"}
            className="h-full object-cover rounded-[10px]"
          />
          <div>
            <p className="text-sm leading-5 dark:text-white">
              #{listing.tokenId}
            </p>
            <p className="text-xs leading-5 text-gray-500 dark:text-zinc-400 dark:text-white">
              {listing.collectionName}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between h-[56px] my-[45px]">
          <p className="text-sm">Listed for</p>
          <div className="text-right">
            <p className="text-sm leading-5 dark:text-white">
              {buyQuote.icpPriceFormatted}
            </p>
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500 dark:text-white">
              {buyQuote.usdPriceFormatted}
            </p>
          </div>
        </div>
        <div
          className={clsx(
            "flex gap-2.5 p-[15px] rounded-[12px] mb-5",
            hasEnoughBalance
              ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500"
              : "bg-orange-50 dark:bg-orange-500/10 text-orange-900 dark:text-amber-600",
          )}
        >
          {hasEnoughBalance ? (
            <IconCmpInfo className="w-6 h-6 text-teal-600 dark:text-teal-500 md:mr-0 min-w-6" />
          ) : (
            <IconCmpWarning className="w-6 h-6 text-orange-900 dark:text-amber-600 md:mr-0 min-w-6 " />
          )}
          <p className="text-sm leading-5">
            {hasEnoughBalance
              ? "Your NFT will be removed from sale and stay in your wallet. The marketplace will lose access to it."
              : `Not enough ICP for the network fee. Add at least ${(
                  Number(buyQuote.ledgerFeeE8s - icpToken?.getTokenBalance()!) /
                  E8S
                )
                  .toFixed(ICP_DECIMALS)
                  .replace(TRIM_ZEROS, "")}
                ICP to delist this NFT.`}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="stroke" className="w-full" onClick={onClose}>
            Keep listing
          </Button>
          <Button
            type="red"
            disabled={!hasEnoughBalance || isDelisting}
            className="w-full"
            onClick={delist}
            iconEnd={isDelisting ? <Spinner /> : null}
          >
            Delist
          </Button>
        </div>
      </motion.div>
    </>
  )
}
