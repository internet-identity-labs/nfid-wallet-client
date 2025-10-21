import clsx from "clsx"
import { useState, useMemo, HTMLAttributes, FC, MouseEvent } from "react"
import { IoIosSearch } from "react-icons/io"
import { Link, useNavigate } from "react-router-dom"

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
}

export const NFTs: FC<INFTs> = ({
  isLoading,
  nfts,
  searchTokens,
  links,
  totalItems,
  currentPage,
  onTransferNFT,
}) => {
  const isDarkTheme = useDarkTheme()
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")
  const navigate = useNavigate()

  const nftsFiltered = useMemo(() => searchTokens(nfts, search), [nfts, search])

  return (
    <>
      {nfts.length > 0 && (
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
            className="w-full"
          />
          <div className={clsx("flex items-center space-x-6 shrink-0")}>
            <NFTDisplaySwitch state={display} setState={setDisplay} />
          </div>
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
                      `${links.base}/${links.nfts}/${nft.getTokenId()}`,
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
                        src={nft.getError() ? "#" : nft.getAssetPreview()?.url}
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
                    {nft.getTokenFloorPriceIcpFormatted() ? (
                      <>
                        <p className="leading-[26px] dark:text-white">
                          {nft.getTokenFloorPriceIcpFormatted()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-[20px]">
                          {nft.getTokenFloorPriceUSDFormatted()}
                        </p>
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </td>
                  <td>
                    {!nft.getError() && (
                      <div
                        className="p-[12px] w-[42px] ml-auto hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-[12px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTransferNFT(nft.getTokenId())
                        }}
                      >
                        <IconCmpArrow className="rotate-[135deg] w-[18px] h-[18px] text-gray-400 cursor-pointer ml-auto" />
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
            return (
              <Link
                key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                to={`${links.base}/${links.nfts}/${nft.getTokenId()}`}
                state={{ currentPage }}
              >
                <div
                  className={clsx(
                    "cursor-pointer rounded-[12px] bg-gray-50 dark:bg-zinc-800 group hover:shadow-xl dark:hover:bg-zinc-700 transition-all",
                    "h-full flex flex-col",
                  )}
                  key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                >
                  <div className="relative rounded-[12px] overflow-hidden basis-[100%] flex items-center justify-center">
                    {nft.getError() ? (
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
                    ) : nft.getAssetPreview()?.format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="w-full"
                        src={nft.getAssetPreview()?.url}
                      ></video>
                    ) : (
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
                        ) : nft.getTokenFloorPriceIcpFormatted() ? (
                          <>
                            <p className="leading-[26px] dark:text-white">
                              {nft.getTokenFloorPriceIcpFormatted()}
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
