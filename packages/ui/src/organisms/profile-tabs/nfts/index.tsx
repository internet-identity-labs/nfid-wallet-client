import { useActor } from "@xstate/react"
import clsx from "clsx"
import {
  useContext,
  useState,
  useMemo,
  useCallback,
  HTMLAttributes,
  FC,
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
} from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { link } from "frontend/integration/entrepot"
import { ProfileContext } from "frontend/provider"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import EmptyNFT from "./empty.webp"
// import { ProfileConstants } from "../routes"
import { NFTDisplaySwitch } from "./nft-display-switch"

// import { CollectiblesModal } from "./filter-modal"
// import {
//   filterUserTokens,
//   sortUserTokens,
//   userTokensByCollection,
//   userTokensByWallet,
// } from "./utils/util"

interface NFTsProps extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  nfts: UserNonFungibleToken[]
  applications: Application[]
}

export const NFTs: FC<NFTsProps> = ({ isLoading, nfts }) => {
  const [search, setSearch] = useState("")
  const [display, setDisplay] = useState<"grid" | "table">("grid")
  const globalServices = useContext(ProfileContext)
  //navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)

  return (
    <>
      {/* <div className="flex items-center justify-between gap-6">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          icon={<IoIosSearch size="20" />}
          placeholder="Search"
          inputClassName="bg-white border-none"
          className="w-full"
        />
        <div className={clsx("flex items-center space-x-6 shrink-0")}>
          <DisplaySwitch state={display} setState={setDisplay} />
        </div>
      </div> */}
      <p
        id={"items-amount"}
        className={clsx(
          "text-sm text-center text-secondary h-[50px] leading-[50px]",
          nfts.length === 0 && "hidden",
        )}
      >
        2 items
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
        // <Table
        //   rows={rows}
        //   headings={headings}
        //   sort={sorting}
        //   reverse={reverse}
        //   handleHeaderClick={handleHeaderClick}
        // />
        "Table view"
      ) : (
        <div
          className={clsx(
            "grid gap-5 pb-5",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          )}
        >
          {nfts.map((token) => (
            <NFTPreview key={`token_${token.tokenId}`} {...token} />
          ))}
        </div>
      )}
    </>
  )
}
