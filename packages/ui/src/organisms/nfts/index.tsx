import clsx from "clsx"
import { useState, useMemo, HTMLAttributes, FC, MouseEvent } from "react"
import { IoIosSearch } from "react-icons/io"
import { Link, useNavigate } from "react-router-dom"

import {
  IconCmpArrow,
  Input,
  Table,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { NFT } from "frontend/integration/nft/nft"

import EmptyNFT from "./assets/empty.webp"

import { GalleryNftSkeleton, TableNftSkeleton } from "../../atoms/skeleton"
import { NFTDisplaySwitch } from "./nft-display-switch"

export interface INFTs extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  nfts: NFT[]
  searchTokens: (tokens: NFT[], search: string) => NFT[]
  onTransferNFT: (e: MouseEvent<HTMLDivElement>, id: string) => void
  links: {
    base: string
    nfts: string
  }
  totalItems: number
}

export const NFTs: FC<INFTs> = ({
  isLoading,
  nfts,
  searchTokens,
  links,
  onTransferNFT,
  totalItems,
}) => {
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")
  const navigate = useNavigate()

  const nftsFiltered = useMemo(() => searchTokens(nfts, search), [nfts, search])

  return (
    <>
      <div className="bg-gray-100 p-[20px] rounded-[12px]">
        <div className="flex items-center justify-between gap-6">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IoIosSearch size="20" className="text-gray-400" />}
            placeholder="Search"
            inputClassName="bg-white border-none"
            className="w-full"
          />
          <div className={clsx("flex items-center space-x-6 shrink-0")}>
            <NFTDisplaySwitch state={display} setState={setDisplay} />
          </div>
        </div>
      </div>
      <p
        id={"items-amount"}
        className={clsx(
          "text-sm text-center text-gray-400 h-[50px] leading-[50px]",
          nftsFiltered.length === 0 && "hidden",
        )}
      >
        {totalItems} items
      </p>
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
          <span className="w-full my-16 text-sm text-center text-gray-400 md:text-left">
            You don’t own any collectibles yet
          </span>
          <img
            className={clsx(
              "w-[100vw] absolute right-[-1rem] mt-[120px] ",
              "sm:right-[-30px] md:mt-0 md:w-[40vw]",
            )}
            src={EmptyNFT}
          />
        </div>
      ) : display === "table" ? (
        <div className="max-w-[100%] overflow-auto">
          <Table
            className="!min-w-[1000px]"
            theadClassName="!h-0 sm:!h-[40px]"
            id="nft-table"
            tableHeader={
              <tr className="text-sm font-bold text-gray-400">
                <th className="w-[86px]">Asset</th>
                <th>Name</th>
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
                    navigate(`${links.base}/${links.nfts}/${nft.getTokenId()}`)
                  }
                >
                  <td>
                    {nft.getAssetPreview().format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="w-[74px] rounded-[12px]"
                        src={nft.getAssetPreview().url}
                      ></video>
                    ) : (
                      <ImageWithFallback
                        alt={`${nft.getCollectionName()} ${nft.getTokenId()}`}
                        fallbackSrc={IconNftPlaceholder}
                        src={nft.getAssetPreview().url}
                        className={clsx(
                          `w-[74px] h-[74px] object-cover rounded-[12px] my-[5px]`,
                        )}
                      />
                    )}
                  </td>
                  <td
                    className="font-semibold"
                    id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
                  >
                    {nft.getTokenName()}
                  </td>
                  <td id={`nft_collection_${nft.getCollectionId()}`}>
                    {nft.getCollectionName()}
                  </td>
                  <td id={`nft_id_${nft.getTokenId()}`}>{nft.getTokenId()}</td>
                  <td>
                    {nft.getTokenFloorPriceIcpFormatted() ? (
                      <>
                        <p className="leading-[26px]">
                          {nft.getTokenFloorPriceIcpFormatted()}
                        </p>
                        <p className="text-xs text-gray-400 leading-[20px]">
                          {nft.getTokenFloorPriceUSDFormatted()}
                        </p>
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </td>
                  <td className="">
                    <div
                      className="p-[12px] w-[42px] ml-auto hover:bg-gray-100 rounded-[12px]"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTransferNFT(e, nft.getTokenId())
                      }}
                    >
                      <IconCmpArrow className="rotate-[135deg] w-[18px] h-[18px] text-gray-400 cursor-pointer ml-auto" />
                    </div>
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
              >
                <div
                  className={clsx(
                    "cursor-pointer rounded-[12px] bg-gray-50 group hover:shadow-xl",
                    "h-full flex flex-col",
                  )}
                  key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
                >
                  <div className="relative rounded-[12px] overflow-hidden basis-[100%]">
                    {nft.getAssetPreview().format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="w-full"
                        src={nft.getAssetPreview().url}
                      ></video>
                    ) : (
                      <ImageWithFallback
                        alt={nft.getTokenName()}
                        fallbackSrc={IconNftPlaceholder}
                        src={nft.getAssetPreview().url}
                        className="object-cover w-full aspect-square"
                      />
                    )}
                    <div
                      className={clsx(
                        "absolute top-0 bottom-0 left-0 right-0 m-auto z-2",
                        "bg-white/60 flex justify-center items-center overflow-hidden",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      )}
                      style={{
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="bg-white px-[15px] py-[9px] w-[164px] rounded-[12px] text-center">
                        {nft.getTokenFloorPriceIcpFormatted() ? (
                          <>
                            <p className="leading-[26px]">
                              {nft.getTokenFloorPriceIcpFormatted()}
                            </p>
                            <p className="text-gray-400 text-xs leading-[20px]">
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
                      className="mb-[2px] text-black font-bold leading-[24px]"
                      id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
                    >
                      {nft.getTokenName()}
                    </p>
                    <p
                      className="text-gray-400 leading-[20px]"
                      id={`nft_collection_${nft.getCollectionId()}`}
                    >
                      {nft.getCollectionName()}
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
