import { useActor } from "@xstate/react"
import clsx from "clsx"
import {
  useContext,
  useState,
  useMemo,
  useCallback,
  HTMLAttributes,
  FC,
  useEffect,
} from "react"
import { IoIosSearch } from "react-icons/io"
import { Link, useNavigate } from "react-router-dom"
import { trimConcat } from "src/ui/atoms/util/util"

import {
  FilterPopover,
  Copy,
  IconCmpFilters,
  IconCmpTransfer,
  IconSvgBook,
  Input,
  Loader,
  Tooltip,
  Table,
} from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { link } from "frontend/integration/entrepot"
import { NFT } from "frontend/integration/nft/nft"
import { ProfileContext } from "frontend/provider"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import { NFTProps } from "frontend/ui/pages/new-profile/profile"

import EmptyNFT from "./assets/empty.webp"

import { NFTDisplaySwitch } from "./nft-display-switch"

interface INFTs extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  nfts: NFT[]
  //applications: Application[]
}

export const NFTs: FC<INFTs> = ({ isLoading, nfts }) => {
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")
  const globalServices = useContext(ProfileContext)
  //navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
  console.log("nftsss", nfts)

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
          nfts.length === 0 && "hidden",
        )}
      >
        {nfts.length} items
      </p>
      {!nfts.length ? (
        <>
          {isLoading ? (
            <Loader isLoading={true} />
          ) : (
            <div className="flex justify-between">
              <span className="my-16 text-sm text-gray-400">
                You don’t own any collectibles yet
              </span>
              <img
                className="w-[100vw] absolute md:w-[40vw] right-0"
                src={EmptyNFT}
              />
            </div>
          )}
        </>
      ) : display === "table" ? (
        <Table
          className="!min-w-0"
          theadClassName="!h-0 sm:!h-16"
          id="nft-table"
          tableHeader={
            <tr className="border-b border-black hidden sm:table-row">
              <th>Asset</th>
              <th>Name</th>
              <th>Collection</th>
              <th>ID</th>
              <th>Floor price</th>
              <th></th>
            </tr>
          }
        >
          {nfts.map((nft) => {
            return (
              <tr key={`${nft.getCollectionId()}_${nft.getTokenId()}`}>
                <td>
                  <img
                    alt={`${nft.getCollectionName()} ${nft.getTokenId()}`}
                    src={nft.getAssetPreview().url}
                    className={clsx(`w-[74px] h-[74px] object-cover rounded`)}
                  />
                </td>
                <td>{nft.getTokenName()}</td>
                <td>{nft.getCollectionName()}</td>
                <td>{nft.getTokenId()}</td>
                <td>{nft.getTokenFloorPriceIcpFormatted()}</td>
                <td>
                  <a target="_blank" href={nft.getTokenLink()}>
                    Link
                  </a>
                </td>
              </tr>
            )
          })}
        </Table>
      ) : (
        <div
          className={clsx(
            "grid gap-5 pb-5",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
        >
          {nfts.map((nft) => {
            return (
              <div
                className="cursor-pointer rounded-[12px] bg-gray-50 group hover:shadow-xl"
                key={`${nft.getCollectionId()}_${nft.getTokenId()}`}
              >
                <div className="relative rounded-[12px] overflow-hidden">
                  {nft.getAssetPreview().format === "video" && (
                    <video
                      muted
                      autoPlay
                      loop
                      src={nft.getAssetPreview().url}
                    ></video>
                  )}
                  {nft.getAssetPreview().format === "img" && (
                    <img src={nft.getAssetPreview().url} alt="NFID NFT" />
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
                <div className="px-[10px] pt-[10px] pb-[14px]">
                  <p className="mb-[2px] text-black font-bold leading-[24px]">
                    {nft.getTokenName()}
                  </p>
                  <p className="text-gray-400 leading-[20px]">
                    {nft.getCollectionName()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
