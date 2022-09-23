import clsx from "clsx"
import React from "react"

import { NFTDetails } from "frontend/integration/entrepot/types"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import useWindowSize from "frontend/ui/utils/use-window-size"

import { ProfileAssetsNFTItem } from "./nft-item"

interface IProfileAssetsNFT extends React.HTMLAttributes<HTMLDivElement> {
  nfts: NFTDetails[]
}

export const ProfileNFTPresent: React.FC<IProfileAssetsNFT> = ({ nfts }) => {
  const { width } = useWindowSize()

  const visibleLength = React.useMemo(() => {
    // Let's show 4 NFTS on large screens - @Suggestion from Pavlo
    return width < 1536 ? 3 : 4
  }, [width])

  return (
    <div>
      <ProfileContainer
        title={
          <>
            <span>Your NFTs</span>
            <span className="text-sm text-gray-400">{nfts.length} items</span>
          </>
        }
        className={clsx("pb-[26px] mt-[30px] mb-[30px] relative")}
      >
        <div
          className={clsx(
            "grid gap-4 lg:gap-8",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
        >
          {nfts.slice(0, visibleLength).map((nft) => (
            <ProfileAssetsNFTItem
              nft={nft}
              key={`nft_${nft.tokenId}_${Math.random()}`}
            />
          ))}
        </div>
        {nfts.length > visibleLength && (
          <div className="flex justify-center items-center mt-[30px] h-12">
            <p
              className={clsx(
                "text-blue-600 text-sm font-bold tracking-[0.01em]",
                "hover:opacity-50 transition-opacity cursor-pointer",
              )}
            >
              View all
            </p>
          </div>
        )}
      </ProfileContainer>
    </div>
  )
}
