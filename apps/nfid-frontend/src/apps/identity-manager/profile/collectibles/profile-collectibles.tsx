import clsx from "clsx"
import { useAtom } from "jotai"
import React from "react"
import { IoIosSearch } from "react-icons/io"
import { Link, useNavigate } from "react-router-dom"

import {
  Copy,
  IconCmpFilters,
  IconCmpTransfer,
  IconSvgBook,
  Input,
  Loader,
  ModalAdvanced,
  Tooltip,
  transferModalAtom,
} from "@nfid-frontend/ui"
import { Image } from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileConstants } from "../routes"
import { DisplaySwitch } from "./display-switch"
import { CollectiblesModal } from "./filter-modal"
import {
  filterUserTokens,
  sortUserTokens,
  userTokensByCollection,
  userTokensByWallet,
} from "./utils/util"

interface CollectiblesPage extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  tokens: UserNFTDetails[]
  applications: Application[]
}

export const ProfileCollectibles: React.FC<CollectiblesPage> = ({
  isLoading,
  tokens,
  applications,
}) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const [search, setSearch] = React.useState("")
  const [display, setDisplay] = React.useState<"grid" | "table">("grid")

  const [walletsFilter, setWalletsFilter] = React.useState<string[]>([])
  const [collectionsFilter, setCollectionsFilter] = React.useState<string[]>([])
  const [blockchainFilter, setBlockchainFilter] = React.useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)

  const navigate = useNavigate()

  const tokensFiltered = React.useMemo(
    () =>
      filterUserTokens(tokens, { search })
        .filter((token) => {
          if (!walletsFilter.length) return true
          return walletsFilter.includes(token.principal.toText())
        })
        .filter((token) => {
          if (!collectionsFilter.length) return true
          return collectionsFilter.includes(token.collection.id)
        })
        .filter((token) => {
          if (!blockchainFilter.length) return true
          return blockchainFilter.includes(token.blockchain)
        }),
    [tokens, search, walletsFilter, collectionsFilter, blockchainFilter],
  )

  const tokensByCollections = React.useMemo(() => {
    return Object.values(userTokensByCollection(sortUserTokens(tokens)))
  }, [tokens])

  const headings = ["Asset", "Name", "Collection", "ID", "Account", "Actions"]
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
      setTransferModalState({
        ...transferModalState,
        isModalOpen: true,
        sendType: "nft",
        selectedNFT: [tokenId],
      })
    },
    [setTransferModalState, transferModalState],
  )

  const rows = React.useMemo(() => {
    const result = sortUserTokens(tokensFiltered, sorting).map((token) => ({
      key: token.tokenId,
      val: [
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.assets}/${token.tokenId}`}
        >
          <Image
            alt={`${token.collection.name} ${token.index}`}
            src={token.assetPreview}
            className={clsx(`w-[74px] h-[74px] object-cover rounded`)}
          />
        </Link>,
        <div>{token.name}</div>,
        <div className={clsx(`w-full`)}>{token.collection.name}</div>,
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.assets}/${token.tokenId}`}
          className="truncate block sm:w-[400px]"
        >
          {token.tokenId}
        </Link>,
        <div className={clsx(`w-full`)}>
          {getWalletName(
            applications,
            token.account.domain,
            token.account.accountId,
          )}
        </div>,
        <div className="flex items-center space-x-2.5 justify-center">
          <Tooltip tip="Transfer">
            <IconCmpTransfer
              data-tip="Transfer"
              className="transition-opacity cursor-pointer hover:opacity-50"
              onClick={() => onTransferNFT(token.tokenId)}
            />
          </Tooltip>
          <Copy value={link(token.collection.id, token.index)} />
        </div>,
      ],
    }))
    reverse && result.reverse()
    return result
  }, [tokensFiltered, sorting, reverse, applications, onTransferNFT])

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
      label: getWalletName(
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
      icon: option.collection.avatar,
    }))
  }, [tokensByCollections, walletsFilter])

  const blockchainOptions = React.useMemo(() => {
    return [
      {
        label: "Internet Computer",
        value: "ic",
      },
      {
        label: "Ethereum",
        value: "eth",
      },
      {
        label: "Bitcoin",
        value: "btc",
      },
    ]
  }, [])

  const onResetFilters = React.useCallback(() => {
    setBlockchainFilter([])
    setCollectionsFilter([])
    setWalletsFilter([])
  }, [])

  return (
    <ProfileTemplate
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
              <ModalAdvanced
                isModalOpen={isFiltersOpen}
                isModalOpenChange={setIsFiltersOpen}
                secondaryButton={{
                  type: "stroke",
                  onClick: onResetFilters,
                  text: "Reset filter",
                  id: "reset-filters-button",
                  block: true,
                }}
                primaryButton={{
                  type: "primary",
                  onClick: () => setIsFiltersOpen(false),
                  text: "Apply",
                  id: "apply-filters-button",
                  block: true,
                }}
                trigger={
                  <IconCmpFilters className="transition-opacity cursor-pointer hover:opacity-60" />
                }
                title="Filters"
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
              </ModalAdvanced>
              <DisplaySwitch state={display} setState={setDisplay} />
            </div>
          </div>
        </ProfileContainer>
        <p className="text-sm text-center text-secondary h-[50px] leading-[50px]">
          {tokensFiltered.length} items
        </p>
        {!tokens.length ? (
          <>{isLoading ? <Loader isLoading={true} /> : "You have no NFTs!"}</>
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
