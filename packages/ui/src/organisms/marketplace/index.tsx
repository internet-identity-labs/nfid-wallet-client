/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { FC, useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { Button, CopyAddress, Input, Table } from "@nfid-frontend/ui"
import { IconNftPlaceholder, ImageWithFallback } from "@nfid-frontend/ui"

import { MarketplaceListingWithFormatting, MarketplaceType } from "./types"
import { GalleryNftSkeleton } from "../../atoms/skeleton"
import { MarketplaceCard } from "./components/marketplace-card"
import { NFTDisplaySwitch } from "../nfts/nft-display-switch"
import { UserListingsSkeleton } from "../../atoms/skeleton/user-listings-skeleton"
import { useLocation, useNavigate } from "react-router-dom"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

interface MarketplaceProps {
  listings: MarketplaceListingWithFormatting[]
  isListingsLoading: boolean
  sellerListings: MarketplaceListingWithFormatting[]
  isSellerListingsLoading: boolean
  onBuy: (listingId: bigint) => void
  onDelist: (listingId: bigint) => void
  onList: () => void
  initialTab?: MarketplaceType
  isViewOnlyMode: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadMoreLoading?: boolean
}

export const Marketplace: FC<MarketplaceProps> = ({
  listings,
  isListingsLoading,
  sellerListings,
  isSellerListingsLoading,
  onBuy,
  onDelist,
  onList,
  initialTab,
  isViewOnlyMode,
  onLoadMore,
  hasMore,
  isLoadMoreLoading,
}) => {
  const [marketplaceType, setMarketplaceType] = useState<MarketplaceType>(
    initialTab ?? MarketplaceType.Browsing,
  )
  const navigate = useNavigate()
  const { search: locationSearch } = useLocation()

  useEffect(() => {
    if (initialTab) setMarketplaceType(initialTab)
  }, [initialTab])
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")

  const filtered = useMemo(() => {
    if (!search) return listings
    const q = search.toLowerCase()
    return listings.filter(
      (l) =>
        l.collectionName.toLowerCase().includes(q) ||
        l.tokenId.toString().includes(q),
    )
  }, [listings, search])

  return (
    <>
      {!isViewOnlyMode && (
        <div className="flex items-center gap-3 mb-6 sm:gap-6 font-inter">
          <span
            className={clsx(
              "sm:text-[24px] leading-6 cursor-pointer",
              marketplaceType === MarketplaceType.Browsing
                ? "dark:text-white"
                : "text-gray-500 dark:text-zinc-500",
            )}
            onClick={() => setMarketplaceType(MarketplaceType.Browsing)}
          >
            Browse
          </span>
          <div className="flex gap-1.5 sm:gap-2.5 items-center">
            <span
              className={clsx(
                "sm:text-[24px] leading-6 cursor-pointer",
                marketplaceType === MarketplaceType.MyListings
                  ? "dark:text-white"
                  : "text-gray-500 dark:text-zinc-500",
              )}
              onClick={() => setMarketplaceType(MarketplaceType.MyListings)}
            >
              My listings
            </span>
            <div
              className={clsx(
                "flex items-center justify-center w-5 h-5",
                "text-white text-xs font-semibold rounded-[4px]",
                marketplaceType === MarketplaceType.Browsing
                  ? "bg-gray-400 dark:bg-zinc-500"
                  : "bg-black dark:bg-zinc-400",
              )}
            >
              {sellerListings.length}
            </div>
          </div>
          <Button type="ghost" className="ml-auto" onClick={onList}>
            List an NFT
          </Button>
        </div>
      )}
      {marketplaceType === MarketplaceType.Browsing ? (
        <>
          <div className="flex items-center justify-between gap-6 mb-5">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              icon={
                <IoIosSearch
                  size="20"
                  className="text-black dark:text-zinc-500"
                />
              }
              placeholder="Search"
              inputClassName="bg-white !border-black dark:!border-zinc-500"
              className="w-full !mb-0"
            />
            <div className={clsx("flex items-center space-x-6 shrink-0")}>
              <NFTDisplaySwitch state={display} setState={setDisplay} />
            </div>
          </div>
          {isListingsLoading ? (
            <div
              className={clsx(
                "grid gap-5 pb-5 pt-[50px]",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
              )}
            >
              <GalleryNftSkeleton nftsAmount={4} />
            </div>
          ) : !filtered.length ? (
            <div className="text-center py-[60px]">
              <p className="dark:text-white font-bold leading-6 text-[20px] mb-3">
                {Boolean(search)
                  ? `No NFTs found for “${search}”`
                  : "There is no active listings"}
              </p>
              <p className="text-sm leading-[17px] text-gray-600 dark:text-zinc-400 max-w-[400px] mx-auto">
                {Boolean(search)
                  ? "Check the spelling or search by collection name."
                  : "List an NFT from your wallet. It stays with you until someone buys it, and you can delist it any time."}
              </p>
            </div>
          ) : display === "table" ? (
            <div className="max-w-[100%] overflow-auto">
              <Table
                className="!min-w-[800px]"
                theadClassName="!h-0 sm:!h-[40px]"
                id="marketplace-table"
                tableHeader={
                  <tr className="text-sm font-bold text-gray-400 dark:text-zinc-500">
                    <th className="">Asset</th>
                    <th>Collection</th>
                    <th>Seller</th>
                    <th className="w-[180px]">Floor price</th>
                    <th className="w-[180px]">Price</th>
                    <th className="w-[80px]"></th>
                  </tr>
                }
              >
                {filtered.map((listing) => (
                  <tr
                    className="text-sm"
                    key={`${listing.collectionId}_${listing.tokenId}`}
                    onClick={() =>
                      navigate({
                        pathname: `${ProfileConstants.base}/${ProfileConstants.nfts}/${listing.collectionId}/${listing.tokenId}`,
                        search: locationSearch,
                      })
                    }
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          alt={`${listing.collectionName} #${listing.tokenId}`}
                          fallbackSrc={IconNftPlaceholder}
                          src={listing.imageUrl ?? "#"}
                          className="w-[74px] h-[74px] object-cover rounded-[12px] my-[5px]"
                        />
                        <span className="text-sm font-semibold dark:text-white">
                          #{listing.tokenId}
                        </span>
                      </div>
                    </td>
                    <td className="font-semibold dark:text-white">
                      {listing.collectionName}
                    </td>
                    <td>
                      <CopyAddress
                        className="text-sm text-black dark:text-white"
                        address={listing.seller}
                        leadingChars={6}
                        trailingChars={4}
                      />
                    </td>
                    <td>
                      {listing.floorPriceIcp ? (
                        <>
                          <p className="leading-[17px] text-sm font-semibold dark:text-white">
                            {listing.floorPriceIcp}
                          </p>
                          <p className="leading-[15px] text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                            {listing.floorPriceUsd}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm dark:text-white">
                          No floor price
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="leading-[17px] text-sm font-semibold dark:text-white">
                        {listing.icpPriceFormatted}
                      </p>
                      <p className="leading-[15px] text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                        {listing.usdPriceFormatted}
                      </p>
                    </td>
                    <td>
                      {isViewOnlyMode ? null : !listing.isOwnListing ? (
                        <Button
                          isSmall
                          className="w-[100px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            onBuy(listing.id)
                          }}
                        >
                          Buy now
                        </Button>
                      ) : (
                        <div
                          className={clsx(
                            "bg-teal-50 dark:bg-zinc-900",
                            "flex items-center text-xs font-semibold leading-4",
                            "h-[25px] text-teal-600 py-[5px] px-2 rounded-[8px]",
                          )}
                        >
                          Your listing
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          ) : (
            <div
              className={clsx(
                "grid gap-5 pb-5",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
              )}
            >
              {filtered.map((listing) => (
                <MarketplaceCard
                  key={`${listing.collectionId}_${listing.tokenId}`}
                  listing={listing}
                  onBuy={onBuy}
                  isViewOnlyMode={isViewOnlyMode}
                />
              ))}
            </div>
          )}
          {!search && onLoadMore && (
            <Button
              disabled={isLoadMoreLoading}
              className={clsx(
                "block mx-auto mt-4",
                (!hasMore || !listings.length || isLoadMoreLoading) && "hidden",
              )}
              onClick={onLoadMore}
              type="ghost"
            >
              {isLoadMoreLoading ? "Loading..." : "Load more"}
            </Button>
          )}
        </>
      ) : isSellerListingsLoading ? (
        <div className="space-y-5">
          <UserListingsSkeleton listingsAmount={3} />
        </div>
      ) : sellerListings.length ? (
        <div className="max-w-[100%] overflow-auto">
          <Table
            className="!min-w-[800px]"
            theadClassName="!h-0 sm:!h-[40px]"
            id="marketplace-table"
            tableHeader={
              <tr className="text-sm font-bold text-gray-400 dark:text-zinc-500">
                <th className="">Asset</th>
                <th>Collection</th>
                <th className="w-[180px]">Floor price</th>
                <th className="w-[180px]">Price</th>
                <th className="w-[80px]"></th>
              </tr>
            }
          >
            {sellerListings.map((listing) => (
              <tr
                className="text-sm"
                key={`${listing.collectionId}_${listing.tokenId}`}
                onClick={() =>
                  navigate(
                    `${ProfileConstants.base}/${ProfileConstants.nfts}/${listing.collectionId}/${listing.tokenId}`,
                  )
                }
              >
                <td>
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      alt={`${listing.collectionName} #${listing.tokenId}`}
                      fallbackSrc={IconNftPlaceholder}
                      src={listing.imageUrl ?? "#"}
                      className="w-[74px] h-[74px] object-cover rounded-[12px] my-[5px]"
                    />
                    <span className="text-sm font-semibold dark:text-white">
                      #{listing.tokenId}
                    </span>
                  </div>
                </td>
                <td className="font-semibold dark:text-white">
                  {listing.collectionName}
                </td>
                <td>
                  {listing.floorPriceIcp ? (
                    <>
                      <p className="leading-[17px] text-sm font-semibold dark:text-white">
                        {listing.floorPriceIcp}
                      </p>
                      <p className="leading-[15px] text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                        {listing.floorPriceUsd}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm dark:text-white">No floor price</p>
                  )}
                </td>
                <td>
                  <p className="leading-[17px] text-sm font-semibold dark:text-white">
                    {listing.icpPriceFormatted}
                  </p>
                  <p className="leading-[15px] text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {listing.usdPriceFormatted}
                  </p>
                </td>
                <td>
                  <Button
                    className="w-[70px]"
                    isSmall
                    type="stroke"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelist(listing.id)
                    }}
                  >
                    Delist
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      ) : (
        <div className="text-center py-[60px]">
          <p className="dark:text-white font-bold leading-6 text-[20px] mb-3">
            You have no listings
          </p>
          <p className="text-sm leading-[17px] text-gray-600 dark:text-zinc-400 max-w-[400px] mx-auto">
            List an NFT from your wallet. It stays with you until someone buys
            it, and you can delist it any time.
          </p>
        </div>
      )}
    </>
  )
}
