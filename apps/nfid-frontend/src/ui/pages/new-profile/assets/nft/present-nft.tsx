import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import useWindowSize from "frontend/ui/utils/use-window-size"

interface IProfileAssetsNFT extends React.HTMLAttributes<HTMLDivElement> {
  nfts: UserNonFungibleToken[]
}

export const ProfileNFTPresent: React.FC<IProfileAssetsNFT> = ({ nfts }) => {
  const { width } = useWindowSize()

  const visibleLength = React.useMemo(() => {
    return width < 1536 ? 3 : 4
  }, [width])

  return (
    <div>
      <ProfileContainer
        title={
          <>
            <span>Your latest collectibles</span>
            <Link
              className={clsx(
                "text-blue text-sm font-bold tracking-[0.01em]",
                "hover:opacity-80 transition-opacity cursor-pointer",
                "flex items-center space-x-1",
              )}
              to={`${ProfileConstants.base}/${ProfileConstants.collectibles}`}
            >
              <span>View all</span>
              <span
                id={"nfts-length"}
                className={clsx(
                  "text-xs font-bold text-white bg-blue-600 rounded-lg",
                  "flex item-center justify-center",
                  "px-2 py-[1px]",
                )}
              >
                {nfts.length}
              </span>
            </Link>
          </>
        }
        className={clsx("pb-[26px] mt-[30px] mb-[30px] relative")}
        id={"asset-collection-nft"}
      >
        <div
          className={clsx(
            "grid gap-5 mt-2",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
          id={"nft-container"}
        >
          {nfts.slice(0, visibleLength).map((nft) => (
            <NFTPreview {...nft} key={`nft_${nft.tokenId}_${Math.random()}`} />
          ))}
        </div>
      </ProfileContainer>
    </div>
  )
}
