/* eslint-disable @nx/enforce-module-boundaries */
import { motion } from "framer-motion"
import { FC } from "react"

import {
  BlurredLoader,
  Button,
  IconCmpInfo,
  IconCmpWarning,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import clsx from "clsx"
import {
  BuyQuoteWithFormatting,
  MarketplaceListingWithFormatting,
} from "../../marketplace/types"
import { NFTMarketplaceSuccessUi } from "./nft-marketplace-success"
import {
  E8S,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"

export interface BuyNFTUiProps {
  error: string | undefined
  isSuccessOpen: boolean
  isLoading: boolean
  onClose: () => void
  onBuy: () => Promise<void>
  listing: MarketplaceListingWithFormatting | undefined
  icpToken: FT | undefined
  status: SendStatus
  buyQuote: BuyQuoteWithFormatting | undefined
}

export const BuyNFTUi: FC<BuyNFTUiProps> = ({
  error,
  isSuccessOpen,
  isLoading,
  onClose,
  onBuy,
  listing,
  icpToken,
  status,
  buyQuote,
}) => {
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
    (icpToken.getTokenBalance() ?? BigInt(0)) >= buyQuote.total

  return (
    <>
      {isSuccessOpen && (
        <motion.div
          key="successModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <NFTMarketplaceSuccessUi
            assetImg={listing.imageUrl ?? ""}
            title={`#${listing.tokenId}`}
            subTitle={`${listing.collectionName}`}
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
          />
        </motion.div>
      )}
      <motion.div
        key="formModal"
        initial={{ opacity: !isSuccessOpen ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className="leading-10 text-[20px] font-bold">Review purchase</div>
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
        <div className="flex items-center justify-between h-[56px]">
          <p className="text-sm">Price</p>
          <div className="text-right">
            <p className="text-sm leading-5 dark:text-white">
              {buyQuote.icpPriceFormatted}
            </p>
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500 dark:text-white">
              {buyQuote.usdPriceFormatted}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between h-[56px]">
          <p className="text-sm">Network fee</p>
          <div className="text-right">
            <p className="text-sm leading-5 dark:text-white">
              {buyQuote.icpFeeFormatted}
            </p>
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500 dark:text-white">
              {buyQuote.icpFeeUsdFormatted}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between h-[56px]">
          <p className="text-sm">Balance</p>
          <div className="text-right">
            <p className="text-sm leading-5 dark:text-white">
              {icpToken.getTokenBalanceFormatted() ?? "0 ICP"}
            </p>
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500">
              {icpToken.getUSDBalanceFormatted()}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between h-[56px]">
          <p className="text-sm font-bold">Total</p>
          <div className="text-right">
            <p className="text-sm font-bold leading-5 dark:text-white">
              {buyQuote.totalFormatted}
            </p>
            <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500 dark:text-white">
              {buyQuote.totalUsdFormatted}
            </p>
          </div>
        </div>
        <div
          className={clsx(
            "flex gap-2.5 p-[15px] rounded-[12px] mt-1 mb-5",
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
              ? `The marketplace will send ${buyQuote.sellerReceivesFormatted} to the
            seller and transfer this NFT to your wallet in one transaction.`
              : `Not enough ICP. You need ${(
                  Number(buyQuote.total - icpToken?.getTokenBalance()!) / E8S
                )
                  .toFixed(ICP_DECIMALS)
                  .replace(TRIM_ZEROS, "")}
                ICP more to buy this NFT.`}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="stroke" className="w-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!hasEnoughBalance}
            className="w-full"
            onClick={onBuy}
          >
            Buy
          </Button>
        </div>
      </motion.div>
    </>
  )
}
