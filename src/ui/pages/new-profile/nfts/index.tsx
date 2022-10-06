import clsx from "clsx"
import React from "react"
import { AiOutlineWallet } from "react-icons/ai"
import { BiGridAlt } from "react-icons/bi"
import { FiCopy } from "react-icons/fi"
import { HiViewList } from "react-icons/hi"
import { IoIosSearch } from "react-icons/io"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Application } from "frontend/integration/identity-manager"
import { Accordion } from "frontend/ui/atoms/accordion"
import { Button } from "frontend/ui/atoms/button"
import { DropdownSelect } from "frontend/ui/atoms/dropdown-select"
import { Input } from "frontend/ui/atoms/input"
import { Loader } from "frontend/ui/atoms/loader"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import {
  filterUserTokens,
  GetWalletName,
  sortUserTokens,
  userTokensByCollection,
  userTokensByWallet,
} from "./util"

interface IProfileNFTsPage extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  tokens: UserNFTDetails[]
  applications: Application[]
}

const ProfileNFTsPage: React.FC<IProfileNFTsPage> = ({
  isLoading,
  tokens,
  applications,
}) => {
  const [search, setSearch] = React.useState("")
  const [display, setDisplay] = React.useState<"grid" | "table">("grid")
  const [walletsFilter, setWalletsFilter] = React.useState<string[]>([])
  const [collectionsFilter, setCollectionsFilter] = React.useState<string[]>([])

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
        }),
    [tokens, search, walletsFilter, collectionsFilter],
  )

  const tokensByWallet = React.useMemo(
    () =>
      userTokensByWallet(
        Object.values(userTokensByCollection(sortUserTokens(tokensFiltered)))
          .map((x) => x.tokens)
          .flat(),
      ),
    [tokensFiltered],
  )
  const headings = ["Asset", "Token #", "Collection", "Wallet", "URL"]
  const [sorting, setSorting] = React.useState([
    "Wallet",
    "Collection",
    "Token #",
  ])
  const [reverse, setReverse] = React.useState(false)
  const handleHeaderClick = React.useMemo(
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
  const rows = React.useMemo(() => {
    const result = sortUserTokens(tokensFiltered, sorting).map((token) => ({
      key: token.tokenId,
      val: [
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.assets}/${token.tokenId}`}
        >
          <img
            alt={`${token.collection.name} ${token.index}`}
            src={token.assetPreview}
            className={clsx(`w-[74px] h-[74px] object-cover rounded`)}
          />
        </Link>,
        <Link
          to={`${ProfileConstants.base}/${ProfileConstants.assets}/${token.tokenId}`}
        >
          #{token.index}
        </Link>,
        <div className={clsx(`w-full`)}>{token.collection.name}</div>,
        <div className={clsx(`w-full`)}>
          {applications.find((x) => x.domain === token.account.domain)?.name}{" "}
          {token.account.accountId !== "0" &&
            `#${Number(token.account.accountId) + 1}`}
        </div>,
        <FiCopy
          className={clsx(`hover:text-blue-500 cursor-pointer`)}
          size="18"
          onClick={() => {
            toast.info("NFT URL copied to clipboard", {
              toastId: `copied_nft_${token.tokenId}`,
            })
            navigator.clipboard.writeText(
              link(token.collection.id, token.index),
            )
          }}
        />,
      ],
    }))
    reverse && result.reverse()
    return result
  }, [tokensFiltered, sorting, reverse, applications])

  const openAccordions = React.useMemo(() => {
    if (!search) return [Math.random().toString()]
    return Object.values(tokensByWallet).map((x) => Math.random().toString())
  }, [search, tokensByWallet])

  // TODO Refactor
  const walletOptions = React.useMemo(() => {
    const wallets = Object.values(
      userTokensByWallet(
        Object.values(userTokensByCollection(sortUserTokens(tokens)))
          .map((x) => x.tokens)
          .flat(),
      ),
    ).filter((token) => {
      if (!collectionsFilter.length) return true

      return !!token.tokens.filter((t) =>
        collectionsFilter.includes(t.collection.id),
      ).length
    })

    return Object.values(wallets).map((item) => ({
      label: GetWalletName(
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
  }, [applications, collectionsFilter, tokens])

  const collectionsOptions = React.useMemo(() => {
    const tokensByCollection = Object.values(
      userTokensByCollection(sortUserTokens(tokens)),
    ).filter((obj) => {
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
  }, [tokens, walletsFilter])

  return (
    <ProfileTemplate
      pageTitle="Your NFTs"
      headerMenu={<DisplaySwitch onClick={setDisplay} state={display} />}
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
      className="overflow-inherit"
    >
      <div className={clsx(`flex flex-col gap-6 pb-10`)}>
        <ProfileContainer className={clsx(`bg-gray-200`)}>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IoIosSearch size="20" />}
            placeholder="Search by NFT name, ID or collection"
            inputClassName="bg-white border-none"
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DropdownSelect
              bordered={false}
              options={collectionsOptions}
              label="Collections"
              onChange={setCollectionsFilter}
              isSearch
            />
            <DropdownSelect
              bordered={false}
              options={walletOptions}
              label="Wallets"
              onChange={setWalletsFilter}
              isSearch
            />
          </div>
        </ProfileContainer>
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
          Object.values(tokensByWallet)
            .sort((a, b) => (a.account.label < b.account.label ? -1 : 1))
            .map((wallet, i) => (
              <ProfileContainer
                key={`wallet${wallet.principal}`}
                // title={wallet.account.label}
              >
                <Accordion
                  openTrigger={openAccordions[i]}
                  isBorder={false}
                  style={{ padding: 0 }}
                  title={
                    <div
                      className={clsx(
                        `flex justify-between items-center w-[100%] gap-5`,
                      )}
                    >
                      <div
                        className={clsx(
                          `flex gap-2 items-center font-light`,
                          "text-sm lg:text-base",
                        )}
                      >
                        <AiOutlineWallet />{" "}
                        {GetWalletName(
                          applications,
                          wallet.account.domain,
                          wallet.account.accountId,
                        )}
                      </div>
                      <div
                        className={clsx(
                          "text-xs lg:text-sm text-gray-400 font-light mr-3 flex-shrink-0",
                        )}
                      >
                        {wallet.tokens.length} Item
                        {wallet.tokens.length > 1 && "s"}
                      </div>
                    </div>
                  }
                  details={
                    <div
                      className={clsx(
                        "grid gap-4 lg:gap-8 pt-7",
                        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                      )}
                    >
                      {wallet.tokens.map((token) => (
                        <NFTPreview key={`token${token.tokenId}`} {...token} />
                      ))}
                    </div>
                  }
                />
              </ProfileContainer>
            ))
        )}
      </div>
    </ProfileTemplate>
  )
}

export default ProfileNFTsPage

const DisplaySwitch = ({
  state,
  onClick,
}: {
  state: "grid" | "table"
  onClick: (state: "grid" | "table") => void
}) => {
  const handleGridClick = () => {
    onClick("grid")
    ;(document.activeElement as HTMLElement)?.blur()
  }
  const handleTableClick = () => {
    onClick("table")
    ;(document.activeElement as HTMLElement)?.blur()
  }
  return (
    <div className={clsx(`flex gap-3`)}>
      <Button
        onClick={handleGridClick}
        className={clsx(
          `p-0 w-[40px] h-[40px] flex justify-center items-center hover:text-blue-hover transition-all outline-none`,
          state === "grid" && "bg-gray-200",
        )}
      >
        <BiGridAlt size="20" />
      </Button>
      <Button
        onClick={handleTableClick}
        className={clsx(
          `p-0 w-[40px] h-[40px] flex justify-center items-center hover:text-blue-hover transition-all outline-none`,
          state === "table" && "bg-gray-200",
        )}
      >
        <HiViewList size="20" />
      </Button>
    </div>
  )
}
