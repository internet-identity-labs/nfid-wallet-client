import { useActor } from "@xstate/react"
import clsx from "clsx"
import React, { useContext } from "react"
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

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { link } from "frontend/integration/entrepot"
import { ProfileContext } from "frontend/provider"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileConstants } from "../routes"
import { DisplaySwitch } from "./display-switch"
import EmptyNFT from "./empty.webp"
import { CollectiblesModal } from "./filter-modal"
import {
  filterUserTokens,
  sortUserTokens,
  userTokensByCollection,
  userTokensByWallet,
} from "./utils/util"

interface CollectiblesPage extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  tokens: UserNonFungibleToken[]
  applications: Application[]
}

export const ProfileCollectibles: React.FC<CollectiblesPage> = ({
  isLoading,
  tokens,
  applications,
}) => {
  const globalServices = useContext(ProfileContext)

  const [, send] = useActor(globalServices.transferService)
  const [search, setSearch] = React.useState("")
  const [display, setDisplay] = React.useState<"grid" | "table">("grid")

  const [walletsFilter, setWalletsFilter] = React.useState<string[]>([])
  const [collectionsFilter, setCollectionsFilter] = React.useState<string[]>([])
  const [blockchainFilter, setBlockchainFilter] = React.useState<string[]>([])

  const navigate = useNavigate()

  const tokensFiltered = React.useMemo(
    () =>
      filterUserTokens(tokens, { search })
        .filter((token) => {
          if (!collectionsFilter.length) return true
          return collectionsFilter.includes(token.collection.id)
        })
        .filter((token) => {
          if (!blockchainFilter.length) return true
          return blockchainFilter
            .map((f) => f.replace(/\s+/g, ""))
            .includes(token.blockchain.replace(/\s+/g, ""))
        }),
    [tokens, search, collectionsFilter, blockchainFilter],
  )

  const tokensByCollections = React.useMemo(() => {
    return Object.values(userTokensByCollection(sortUserTokens(tokens)))
  }, [tokens])

  const headings = ["Asset", "Name", "Collection", "ID", "Actions"]
  const [sorting, setSorting] = React.useState([
    "Wallet",
    "Collection",
    "Token #",
  ])
  const [reverse, setReverse] = React.useState(false)
  const handleHeaderClick = React.useCallback(
    () => (v: string) => {
      if (!sorting.includes(v)) return
      if (sorting[0] === v) {
        setReverse(!reverse)
      } else {
        const newValue = sorting.map((x) => x)
        newValue.splice(newValue.indexOf(v), 1)
        newValue.unshift(v)
        setSorting(newValue)
      }
    },
    [sorting, reverse],
  )

  const onTransferNFT = React.useCallback(
    (tokenId: string) => {
      const nft = tokens.find((token) => token.tokenId === tokenId)
      if (!nft) return

      send({ type: "ASSIGN_SELECTED_NFT", data: nft.tokenId })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [send, tokens],
  )

  const rows = React.useMemo(() => {
    const result = sortUserTokens(tokensFiltered, sorting).map((token) => ({
      key: token.tokenId,
      val: [
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.collectibles}/${token.tokenId}`}
          state={{ nft: token }}
        >
          <img
            alt={`${token.collection.name} ${token.index}`}
            src={token.assetPreview.url}
            className={clsx(`w-[74px] h-[74px] object-cover rounded`)}
          />
        </Link>,
        <div
          id={
            trimConcat("nft_token_", token.name) +
            "_" +
            trimConcat("", token.collection.id)
          }
        >
          {" "}
          {token.name}
        </div>,
        <div
          id={`nft_collection_${token.collection.id.replace(/\s/g, "")}`}
          className={clsx(`w-full`)}
        >
          {token.collection.name}
        </div>,
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.collectibles}/${token.tokenId}`}
          state={{ nft: token }}
          className="truncate block sm:w-[400px]"
          id={`nft_id_${token.tokenId.replace(/\s/g, "")}`}
        >
          {token.tokenId}
        </Link>,
        <div className="flex items-center space-x-2.5 justify-center shrink-0">
          <Tooltip tip="Transfer">
            <IconCmpTransfer
              data-tip="Transfer"
              className="w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0"
              onClick={() => onTransferNFT(token.tokenId)}
            />
          </Tooltip>
          <Copy
            value={
              token.blockchain === "Internet Computer"
                ? link(token.collection.id, Number(token.index))
                : token.assetFullsize.url
            }
          />
        </div>,
      ],
    }))
    reverse && result.reverse()
    return result
  }, [tokensFiltered, sorting, reverse, onTransferNFT])

  const walletOptions = React.useMemo(() => {
    const wallets = Object.values(
      userTokensByWallet(tokensByCollections.map((x) => x.tokens).flat()),
    ).filter((token) => {
      if (!collectionsFilter.length) return true

      return !!token.tokens.filter((t) =>
        collectionsFilter.includes(t.collection.id),
      ).length
    })

    return Object.values(wallets).map((item) => ({
      label:
        item.account.accountId === "-1"
          ? "NFID Wallet"
          : getWalletName(
              applications,
              item.account.domain,
              item.account.accountId,
            ),
      value: item.principal,
      afterLabel: item.tokens.filter((token) => {
        if (!collectionsFilter.length) return true
        return collectionsFilter.includes(token.collection.id)
      }).length,
    }))
  }, [applications, collectionsFilter, tokensByCollections])

  const collectionsOptions = React.useMemo(() => {
    const tokensByCollection = tokensByCollections.filter((obj) => {
      if (!walletsFilter.length) return true
      return !!obj.tokens.filter((o) =>
        walletsFilter.includes(o.principal.toText()),
      ).length
    })

    return tokensByCollection.map((option) => ({
      label: option.collection.name,
      value: option.collection.id,
      icon: option.collection?.avatar,
    }))
  }, [tokensByCollections, walletsFilter])

  const blockchainOptions = React.useMemo(() => {
    const chains = [...new Set(tokens.map((t) => t.blockchain))]
    return chains.map((blockchain) => ({
      label: blockchain,
      value: blockchain.replace(/\s+/g, ""),
    }))
  }, [tokens])

  const onResetFilters = React.useCallback(() => {
    setBlockchainFilter([])
    setCollectionsFilter([])
    setWalletsFilter([])
  }, [])

  return (
    <ProfileTemplate
      className="!static"
      pageTitle="Collectibles"
      icon={IconSvgBook}
      iconTooltip="Transactions history"
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
    >
      <ProfileContainer className={clsx(`flex flex-col`)}>
        <ProfileContainer className={clsx(`bg-gray-200 !py-5`)}>
          <div className="flex items-center justify-between gap-6">
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
              <FilterPopover
                title="Filter"
                trigger={
                  <div
                    id={"filter-nft"}
                    className="flex items-center justify-center p-2 rounded-md md:bg-white"
                  >
                    <IconCmpFilters className="w-[21px] h-[21px] transition-opacity cursor-pointer hover:opacity-60" />
                  </div>
                }
                onReset={onResetFilters}
              >
                <CollectiblesModal
                  collectionsOptions={collectionsOptions}
                  setCollectionsFilter={setCollectionsFilter}
                  collectionsFilter={collectionsFilter}
                  walletOptions={walletOptions}
                  setWalletsFilter={setWalletsFilter}
                  walletsFilter={walletsFilter}
                  blockchainFilter={blockchainFilter}
                  setBlockchainFilter={setBlockchainFilter}
                  blockchainOptions={blockchainOptions}
                />
              </FilterPopover>
              <DisplaySwitch state={display} setState={setDisplay} />
            </div>
          </div>
        </ProfileContainer>
        <p
          id={"items-amount"}
          className={clsx(
            "text-sm text-center text-secondary h-[50px] leading-[50px]",
            tokens.length === 0 && "hidden",
          )}
        >
          {tokensFiltered.length} items
        </p>
        {!tokens.length ? (
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
            rows={rows}
            headings={headings}
            sort={sorting}
            reverse={reverse}
            handleHeaderClick={handleHeaderClick}
          />
        ) : (
          <div
            className={clsx(
              "grid gap-5 pb-5",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
            )}
          >
            {tokensFiltered.map((token) => (
              <NFTPreview key={`token_${token.tokenId}`} {...token} />
            ))}
          </div>
        )}
      </ProfileContainer>
    </ProfileTemplate>
  )
}
