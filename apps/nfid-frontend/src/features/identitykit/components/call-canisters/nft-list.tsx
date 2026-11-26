import clsx from "clsx"
import React from "react"

import {
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

export interface CallCanisterNFTListProps {
  showNFTList: boolean
  setShowNFTList: (v: boolean) => void
  nftList: {
    tokenId: string
    tokenName: string
    collectionName: string
    tokenImage?: string
  }[]
}

export const CallCanisterNFTList = ({
  nftList,
  showNFTList,
  setShowNFTList,
}: CallCanisterNFTListProps) => {
  return (
    <>
      <div
        className={clsx(
          showNFTList ? "block" : "hidden",
          "absolute bg-white z-[999] w-full h-full lg:h-screen lg-pt-[140px] lg-pb-[40px] dark:bg-zinc-800",
          "left-0 top-0",
          "flex items-center justify-center",
        )}
      >
        <div
          className={clsx(
            "p-5 lg:p-0 flex flex-col",
            "w-full lg:w-3/5 lg:w-[387px] flex flex-col h-full lg:h-auto lg:max-h-[80%]",
          )}
        >
          <p className="text-[20px] lg:text-[28px] font-bold text-center dark:text-white">
            {nftList.length} NFTs
          </p>
          <div className="mt-3">
            {nftList.map((nft) => (
              <div
                key={`${nft.collectionName}_${nft.tokenId}`}
                className="flex gap-2.5 items-center h-[60px]"
              >
                <ImageWithFallback
                  alt={nft.tokenName}
                  src={nft.tokenImage ?? "#"}
                  fallbackSrc={IconNftPlaceholder}
                  className="w-[48px] h-[48px] rounded-[12px] object-cover"
                />
                <div>
                  <span className="text-sm leading-5 text-black dark:text-white">
                    {nft.tokenName}
                  </span>
                  <span className="text-xs leading-5 text-gray-400 dark:text-zinc-500">
                    {nft.collectionName}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <IconCmpArrow
            className={clsx(
              "transition-opacity cursor-pointer hover:opacity-50 z-20",
              "absolute left-5 top-5 dark:text-white",
            )}
            onClick={() => setShowNFTList(false)}
          />
        </div>
      </div>
    </>
  )
}
