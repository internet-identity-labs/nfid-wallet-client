import BigNumber from "bignumber.js"
import clsx from "clsx"
import { HTMLAttributes, FC, useState, useMemo } from "react"
import { FT } from "src/integration/ft/ft"

import SortAscendingIcon from "./assets/sort-ascending.svg"
import SortDefaultIcon from "./assets/sort-default.svg"
import SortDescendingIcon from "./assets/sort-descending.svg"
import SortHoverIcon from "./assets/sort-hover.svg"

import { TableTokenSkeleton } from "../../atoms/skeleton"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { ActiveToken } from "./components/active-asset"
import { TokensHeader } from "./components/header"
import { NewAssetsModal } from "./components/new-assets-modal"
import { TokenInfoModal } from "./components/token-info-modal"

export interface IProfileConstants {
  base: string
  activity: string
}

enum Sorting {
  DEFAULT = "DEFAULT",
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
}

export interface TokensProps extends HTMLAttributes<HTMLDivElement> {
  activeTokens: FT[]
  allTokens: FT[]
  isTokensLoading: boolean
  profileConstants: IProfileConstants
  onSubmitIcrc1Pair: (ledgerID: string, indexID: string) => Promise<void>
  onFetch: (
    ledgerID: string,
    indexID: string,
  ) => Promise<{
    name: string
    symbol: string
    logo: string | undefined
    decimals: number
    fee: bigint
  }>
  onSendClick: (value: string) => void
  hideZeroBalance: boolean
  onZeroBalanceToggle: () => void
}

export const Tokens: FC<TokensProps> = ({
  activeTokens,
  allTokens,
  isTokensLoading,
  profileConstants,
  onSubmitIcrc1Pair,
  onFetch,
  onSendClick,
  hideZeroBalance,
  onZeroBalanceToggle,
}) => {
  const [token, setToken] = useState<FT | undefined>()
  const [sorting, setSorting] = useState<Sorting>(Sorting.DEFAULT)
  const [isHovered, setIsHovered] = useState(false)
  const [loadingToken, setLoadingToken] = useState<FT | null>(null)

  const handleSorting = () => {
    const nextSorting = {
      [Sorting.DEFAULT]: Sorting.DESCENDING,
      [Sorting.DESCENDING]: Sorting.ASCENDING,
      [Sorting.ASCENDING]: Sorting.DEFAULT,
    }[sorting]

    setSorting(nextSorting)
  }

  const getSortingIcon = () => {
    if (isHovered && sorting === Sorting.DEFAULT) return SortHoverIcon
    switch (sorting) {
      case Sorting.ASCENDING:
        return SortAscendingIcon
      case Sorting.DESCENDING:
        return SortDescendingIcon
      default:
        return SortDefaultIcon
    }
  }

  const sortedTokens = useMemo(() => {
    const getUSDBalance = (token: typeof activeTokens[0]) => {
      const balance = token.getUSDBalance()
      return balance ? new BigNumber(balance) : null
    }

    if (sorting === Sorting.ASCENDING) {
      return [...activeTokens].sort((a, b) => {
        const balanceA = getUSDBalance(a)
        const balanceB = getUSDBalance(b)

        if (balanceA === null) return 1
        if (balanceB === null) return -1

        return balanceA.comparedTo(balanceB)
      })
    }

    if (sorting === Sorting.DESCENDING) {
      return [...activeTokens].sort((a, b) => {
        const balanceA = getUSDBalance(a)
        const balanceB = getUSDBalance(b)

        if (balanceA === null) return 1
        if (balanceB === null) return -1

        return balanceB.comparedTo(balanceA)
      })
    }

    return activeTokens
  }, [activeTokens, sorting])

  return (
    <>
      <TokensHeader
        tokens={allTokens}
        onSubmitIcrc1Pair={onSubmitIcrc1Pair}
        onFetch={onFetch}
        setLoadingToken={setLoadingToken}
        hideZeroBalance={hideZeroBalance}
        onZeroBalanceToggle={onZeroBalanceToggle}
      />
      <div className="overflow-x-scroll">
        <table className="w-full text-left">
          <thead className="text-secondary h-[40px] hidden md:table-header-group">
            <tr className="text-sm font-bold leading-5">
              <th className="w-[25%] min-w-[100px] pr-[30px]">Name</th>
              <th className="w-[25%] pr-[10px] min-w-[100px]">Category</th>
              <th className="w-[25%] pr-[10px] min-w-[100px]">Price</th>
              <th className="w-[25%] pr-[10px] min-w-[100px]">Token balance</th>
              <th
                className={clsx(
                  "w-[25%] pr-[10px] min-w-[120px]",
                  "cursor-pointer hover:text-gray-500 gap-[6px]",
                )}
                onClick={handleSorting}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="whitespace-nowrap flex">
                  USD balance{" "}
                  <img
                    className="w-[18px] h-[18px] ms-[5px]"
                    src={getSortingIcon()}
                    alt="Sorting"
                  />
                </span>
              </th>
              <th className="w-[30px] lg:w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="h-16 text-sm text-black">
            {isTokensLoading ? (
              <TableTokenSkeleton
                tableRowsAmount={5}
                tableCellAmount={getIsMobileDeviceMatch() ? 2 : 4}
              />
            ) : (
              sortedTokens.map((token, index, arr) => (
                <ActiveToken
                  key={`token_${token.getTokenAddress()}_${token.getTokenState()}`}
                  token={token}
                  tokens={allTokens}
                  profileConstants={profileConstants}
                  onSendClick={onSendClick}
                  setToken={setToken}
                  dropdownPosition={index + 4 > arr.length ? "top" : "bottom"}
                  loadingToken={loadingToken}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <NewAssetsModal tokens={null} />
      <TokenInfoModal token={token} onClose={() => setToken(undefined)} />
    </>
  )
}
