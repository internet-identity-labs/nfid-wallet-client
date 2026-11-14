/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { useState, useMemo, HTMLAttributes, FC, useContext } from "react"
import { IoIosSearch } from "react-icons/io"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
  IconCmpArrow,
  Input,
  Table,
  IconNftPlaceholder,
  IconNftPlaceholderDark,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { NFT } from "frontend/integration/nft/nft"

import EmptyNFTDark from "./assets/empty-dark.png"
import EmptyNFT from "./assets/empty.webp"

import { GalleryNftSkeleton, TableNftSkeleton } from "../../atoms/skeleton"
import { NFTDisplaySwitch } from "./nft-display-switch"
import { getNetworkIcon } from "../../utils/network-icon"
import { ProfileContext } from "frontend/provider"
import { ManageCollections, NftCollectionMetadata } from "./manage-collections"
import { NftCollection } from "@nfid/integration/marketplace"
import {
  E8S,
  ICP_DECIMALS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { MarketplaceListingWithMeta } from "../marketplace/types"

export interface INFTs extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  nfts: NFT[]
  searchTokens: (tokens: NFT[], search: string) => NFT[]
  links: {
    base: string
    nfts: string
  }
  totalItems: number
  currentPage: number
  onTransferNFT: (nftId: string) => void
  onFetchIcrc7: (canisterId: string) => Promise<NftCollectionMetadata>
  onSubmitIcrc7: (canisterId: string) => Promise<void>
  onUpdateCollections?: () => Promise<void>
  collections: NftCollection[]
  isCollectionsLoading: boolean
  sellerListings: MarketplaceListingWithMeta[]
}

export const NFTs: FC<INFTs> = ({
  isLoading,
  nfts,
  searchTokens,
  links,
  totalItems: _totalItems,
  currentPage,
  onTransferNFT,
  onFetchIcrc7,
  onSubmitIcrc7,
  onUpdateCollections,
  collections,
  isCollectionsLoading,
  sellerListings,
}) => {
  const isDarkTheme = useDarkTheme()
  const { isViewOnlyMode } = useContext(ProfileContext)
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")
  const navigate = useNavigate()
  const { search: locationSearch } = useLocation()

  const nftsFiltered = useMemo(
    () => searchTokens(nfts, search),
    [nfts, search, searchTokens],
  )

  return (
    <>
      {!!nfts && (
        <div className="flex flex-wrap items-center justify-center gap-5 mb-5">
          <div className="flex items-center w-full gap-5 sm:w-auto sm:flex-1">
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
          <ManageCollections
            collections={collections}
            onSubmitCollection={onSubmitIcrc7}
            onFetch={onFetchIcrc7}
            onUpdate={onUpdateCollections}
            manageBtnDisabled={isCollectionsLoading}
          />
        </div>
      )}
      {isLoading ? (
        <div
          className={clsx(
            "grid gap-5 pb-5 pt-[50px]",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
        >
          <GalleryNftSkeleton nftsAmount={4} />
        </div>
      ) : !nftsFiltered.length ? (
        <div className="flex justify-between">
          <span className="w-full my-20 text-sm text-center text-gray-400 dark:text-zinc-500 md:text-left">
            You don’t own any collectibles yet
          </span>
          <img
            className={clsx(
              "w-[100vw] absolute right-[-1rem] mt-[120px] ",
              "sm:right-[-30px] md:mt-0 md:w-[40vw]",
            )}
            src={isDarkTheme ? EmptyNFTDark : EmptyNFT}
          />
        </div>
      ) : display === "table" ? (
        <div className="max-w-[100%] overflow-auto">
          <Table
            className="!min-w-[1000px]"
            theadClassName="!h-0 sm:!h-[40px]"
            id="nft-table"
            tableHeader={
              <tr className="text-sm font-bold text-gray-400 dark:text-zinc-500">
                <th className="w-[86px]">Asset</th>
                <th>Number</th>
                <th>Collection</th>
                <th>ID</th>
                <th className="w-[120px]">Floor price</th>
                <th className="w-[86px]"></th>
              </tr>
            }
          >
            {nftsFiltered.map((nft) => {
              const listing = sellerListings.find(
                (l) =>
                  l.collectionId === nft.getCollectionId() &&
                  l.tokenId.toString() === nft.getTokenId(),
              )
              if (nft === null) {
                return (
                  <TableNftSkeleton tableRowsAmount={1} tableCellAmount={5} />
                )
              }
              return (
                <tr
                  className="text-sm cursor-pointer"
                  key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                  onClick={() =>
                    navigate(
                      {
                        pathname: `${links.base}/${links.nfts}/${nft.getTokenId()}`,
                        search: locationSearch,
                      },
                      { state: { currentPage } },
                    )
                  }
                >
                  <td>
                    {nft.getAssetPreview()?.format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="w-[74px] rounded-[12px]"
                        src={nft.getAssetPreview()?.url}
                      ></video>
                    ) : (
                      <ImageWithFallback
                        alt={`${nft.getCollectionName()} ${nft.getTokenId()}`}
                        fallbackSrc={
                          isDarkTheme
                            ? IconNftPlaceholderDark
                            : IconNftPlaceholder
                        }
                        src={
                          nft.getError() || nft.getAssetPreview() === undefined
                            ? "#"
                            : nft.getAssetPreview()?.url
                        }
                        className={clsx(
                          `w-[74px] h-[74px] object-cover rounded-[12px] my-[5px]`,
                        )}
                      />
                    )}
                  </td>
                  <td
                    className="font-semibold dark:text-white"
                    id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
                  >
                    #{nft.getTokenNumber()}
                  </td>
                  <td
                    className="dark:text-white"
                    id={`nft_collection_${nft.getCollectionId()}`}
                  >
                    {nft.getCollectionName()}
                  </td>
                  <td
                    className="dark:text-white"
                    id={`nft_id_${nft.getTokenId()}`}
                  >
                    {nft.getTokenId()}
                  </td>
                  <td>
                    {nft.getTokenFloorPriceFormatted() ? (
                      <>
                        <p className="leading-[26px] dark:text-white">
                          {nft.getTokenFloorPriceFormatted()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-[20px]">
                          {nft.getTokenFloorPriceUSDFormatted()}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 leading-[20px]">
                        Unknown floor price
                      </p>
                    )}
                  </td>
                  <td>
                    {!nft.getError() && !isViewOnlyMode && (
                      <div
                        className={clsx(
                          "p-[12px] w-[42px] ml-auto hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-[12px]",
                          listing && "!cursor-not-allowed",
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (listing) return
                          onTransferNFT(nft.getTokenId())
                        }}
                      >
                        <IconCmpArrow
                          className={clsx(
                            "rotate-[135deg] w-[18px] h-[18px] text-gray-400 cursor-pointer ml-auto",
                            listing && "!cursor-not-allowed",
                          )}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </Table>
        </div>
      ) : (
        <div
          className={clsx(
            "grid gap-5 pb-5",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
        >
          {nftsFiltered.map((nft, index) => {
            if (nft === null) {
              return (
                <GalleryNftSkeleton key={`skeleton_${index}`} nftsAmount={1} />
              )
            }
            const listing = sellerListings.find(
              (l) =>
                l.collectionId === nft.getCollectionId() &&
                l.tokenId.toString() === nft.getTokenId(),
            )
            return (
              <Link
                key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                to={{
                  pathname: `${links.base}/${links.nfts}/${nft.getTokenId()}`,
                  search: locationSearch,
                }}
                state={{ currentPage }}
              >
                <div
                  className={clsx(
                    "cursor-pointer rounded-[12px] bg-gray-50 dark:bg-zinc-800 group hover:shadow-xl dark:hover:bg-zinc-700 transition-all",
                    "h-full flex flex-col relative",
                  )}
                  key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                >
                  {listing && (
                    <div
                      className={clsx(
                        "absolute top-[11px] left-[11px] bg-white dark:bg-zinc-900",
                        "flex items-center text-xs font-semibold leading-4 z-[20]",
                        "h-[25px] text-teal-600 py-[5px] px-1.5 rounded-[8px]",
                      )}
                    >
                      Listed · {listing.icpPriceFormatted}
                    </div>
                  )}
                  <div className="relative rounded-[12px] overflow-hidden basis-[100%] flex items-center justify-center relative min-h-[336px]">
                    {nft.getError() || nft.getAssetPreview() === undefined ? (
                      <>
                        <ImageWithFallback
                          alt={nft.getTokenName()}
                          fallbackSrc={
                            isDarkTheme
                              ? IconNftPlaceholderDark
                              : IconNftPlaceholder
                          }
                          src={"#"}
                          className="object-cover aspect-square w-[80px] h-[80px]"
                        />
                        <div className="w-4.5 h-4.5 absolute right-2.5 bottom-2.5 rounded-[6px] bg-white dark:bg-zinc-800">
                          {getNetworkIcon(nft.getChainId(), isDarkTheme, 18)}
                        </div>
                      </>
                    ) : nft.getAssetPreview()?.format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="w-full"
                        src={nft.getAssetPreview()?.url}
                      ></video>
                    ) : (
                      <>
                        <ImageWithFallback
                          alt={nft.getTokenName()}
                          fallbackSrc={
                            isDarkTheme
                              ? IconNftPlaceholderDark
                              : IconNftPlaceholder
                          }
                          src={nft.getAssetPreview()?.url}
                          className="object-cover w-full aspect-square"
                        />
                        <div className="w-4.5 h-4.5 absolute right-2.5 bottom-2.5 rounded-[6px] bg-white dark:bg-zinc-800">
                          {getNetworkIcon(nft.getChainId(), isDarkTheme, 18)}
                        </div>
                      </>
                    )}

                    <div
                      className={clsx(
                        "absolute top-0 bottom-0 left-0 right-0 m-auto z-2",
                        "bg-white/60 dark:bg-zinc-500/60 flex justify-center items-center overflow-hidden",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        nft.getError() && "dark:!bg-black",
                      )}
                      style={{
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        className={clsx(
                          "bg-white dark:bg-black px-[15px] py-[9px] rounded-[12px] text-center",
                          nft.getError() ? "w-full" : "w-[164px]",
                        )}
                      >
                        {nft.getError() ? (
                          <p className="dark:text-white">{nft.getError()}</p>
                        ) : nft.getTokenFloorPriceFormatted() ? (
                          <>
                            <p className="leading-[26px] dark:text-white">
                              {nft.getTokenFloorPriceFormatted()}
                            </p>
                            <p className="text-gray-400 dark:text-zinc-400 text-xs leading-[20px]">
                              {nft.getTokenFloorPriceUSDFormatted()}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-400 text-xs leading-[20px]">
                            Unknown floor price
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-[10px] pt-[10px] pb-[14px] mt-auto">
                    <p
                      className="mb-[2px] text-black dark:text-white font-bold leading-[24px]"
                      id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
                    >
                      {nft.getError() ? (
                        <span className="text-gray-400 dark:text-zinc-400">
                          {nft.getCollectionId()}
                        </span>
                      ) : (
                        <>#{nft.getTokenNumber()}</>
                      )}
                    </p>
                    <p
                      className="text-gray-400 dark:text-zinc-400 leading-[20px]"
                      id={`nft_collection_${nft.getCollectionId()}`}
                    >
                      {nft.getError()
                        ? nft.getCollectionName() || "Loading error"
                        : nft.getCollectionName()}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
