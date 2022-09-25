import clsx from "clsx"
import React from "react"
import { AiOutlineWallet } from "react-icons/ai"
import { BiGridAlt } from "react-icons/bi"
import { FiCopy } from "react-icons/fi"
import { HiViewList } from "react-icons/hi"
import { IoIosSearch } from "react-icons/io"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Accordion } from "frontend/ui/atoms/accordion"
import { Button } from "frontend/ui/atoms/button"
import { Input } from "frontend/ui/atoms/input"
import { Loader } from "frontend/ui/atoms/loader"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import {
  filterUserTokens,
  sortUserTokens,
  userTokensByCollection,
  userTokensByWallet,
} from "./util"

interface IProfileNFTsPage extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  tokens: UserNFTDetails[]
}

const ProfileNFTsPage: React.FC<IProfileNFTsPage> = ({ isLoading, tokens }) => {
  const [search, setSearch] = React.useState("")
  const [display, setDisplay] = React.useState<"grid" | "table">("grid")
  const tokensFiltered = React.useMemo(
    () => filterUserTokens(tokens, { search }),
    [tokens, search],
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
    const result = sortUserTokens(tokensFiltered, sorting).map((token) => [
      <img
        alt={`${token.collection.name} ${token.index}`}
        src={token.assetPreview}
        className={clsx(`w-[74px] h-[74px] object-cover rounded`)}
      />,
      `#${token.index}`,
      <div className={clsx(`w-full`)}>{token.collection.name}</div>,
      <div className={clsx(`w-full`)}>{token.account.label}</div>,
      <FiCopy
        className={clsx(`hover:text-blue-500 cursor-pointer`)}
        size="18"
        onClick={() => {
          toast.info("NFT URL copied to clipboard")
          navigator.clipboard.writeText(link(token.collection.id, token.index))
        }}
      />,
    ])
    reverse && result.reverse()
    return result
  }, [tokensFiltered, sorting, reverse])
  return (
    <ProfileTemplate
      pageTitle="Your NFTs"
      headerMenu={<DisplaySwitch onClick={setDisplay} state={display} />}
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
    >
      <div className={clsx(`flex flex-col gap-6 pb-10`)}>
        {/* <ProfileContainer className={clsx(`bg-gray-200`)}> */}
        <div className={clsx(`px-[4px]`)}>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            inputClassName={clsx(`!bg-white border-slate-100`)}
            icon={<IoIosSearch size="20" />}
            placeholder="Search by NFT name, ID or collection"
          />
        </div>
        {/* </ProfileContainer> */}
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
            .map((wallet) => (
              <ProfileContainer
                key={`wallet${wallet.principal}`}
                // title={wallet.account.label}
              >
                <Accordion
                  isBorder={false}
                  style={{ padding: 0 }}
                  title={
                    <div
                      className={clsx(
                        `flex justify-between items-center w-[100%] gap-5`,
                      )}
                    >
                      <div
                        className={clsx(`flex gap-2 items-center font-light`)}
                      >
                        <AiOutlineWallet /> {wallet.account.label}
                      </div>
                      <div
                        className={clsx(`text-sm text-slate-400 font-light`)}
                      >
                        {wallet.tokens.length} Item
                        {wallet.tokens.length > 1 && "s"}
                      </div>
                    </div>
                  }
                  details={
                    <div
                      className={clsx(
                        `flex justify-center gap-3 flex-wrap pt-7`,
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

const DisplaySwitch = (props: {
  state: "grid" | "table"
  onClick: (state: "grid" | "table") => void
}) => {
  return (
    <div className={clsx(`flex gap-3`)}>
      <Button
        onClick={() => props.onClick("grid")}
        className={clsx(
          `p-0 w-[40px] h-[40px] flex justify-center items-center hover:text-blue-hover transition-all outline-none`,
          props.state === "grid" && "bg-gray-200",
        )}
      >
        <BiGridAlt size="20" />
      </Button>
      <Button
        onClick={() => props.onClick("table")}
        className={clsx(
          `p-0 w-[40px] h-[40px] flex justify-center items-center hover:text-blue-hover transition-all outline-none`,
          props.state === "table" && "bg-gray-200",
        )}
      >
        <HiViewList size="20" />
      </Button>
    </div>
  )
}
