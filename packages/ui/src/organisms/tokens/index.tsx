import BigNumber from "bignumber.js"
import clsx from "clsx"
import { HTMLAttributes, FC, useState, useMemo, useContext } from "react"
import { FT } from "src/integration/ft/ft"
import { useDarkTheme } from "frontend/hooks"

import SortAscendingIcon from "./assets/sort-ascending.svg"
import SortDefaultIcon from "./assets/sort-default.svg"
import SortDescendingIcon from "./assets/sort-descending.svg"
import SortHoverIcon from "./assets/sort-hover.svg"

import { TableTokenSkeleton } from "../../atoms/skeleton"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { ActiveToken } from "./components/active-asset"
import { ManageTokens } from "./components/manage-tokens"
import { TokenInfoModal } from "./components/token-info-modal"
import { ChainFilter } from "./components/chain-filter"
import { SelectedToken } from "frontend/features/transfer-modal/types"
import { IconCmpPortfolioOptions } from "../../atoms/icons"
import { PortfolioOptions } from "./components/portfolio-options"
import { ProfileContext } from "frontend/provider"

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
  initedTokens: FT[]
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
  onSendClick: (value: SelectedToken) => void
  onSwapClick: (value: SelectedToken) => void
  onConvertToBtc: () => void
  onConvertToCkBtc: () => void
  onConvertToEth: () => void
  onConvertToCkEth: () => void
  onConvertToSepoliaEth: () => void
  onConvertToCkSepoliaEth: () => void
  onStakeClick: (value: SelectedToken) => void
  hideZeroBalance: boolean
  onZeroBalanceToggle: () => void
  testnetEnabled: boolean
  onTestnetToggle: () => void
  arbitrumEnabled: boolean
  onArbitrumToggle: () => void
  baseEnabled: boolean
  onBaseToggle: () => void
  polygonEnabled: boolean
  onPolygonToggle: () => void
}

export const Tokens: FC<TokensProps> = ({
  initedTokens,
  allTokens,
  isTokensLoading,
  profileConstants,
  onSubmitIcrc1Pair,
  onFetch,
  onSendClick,
  onSwapClick,
  onConvertToBtc,
  onConvertToCkBtc,
  onConvertToEth,
  onConvertToCkEth,
  onConvertToSepoliaEth,
  onConvertToCkSepoliaEth,
  onStakeClick,
  hideZeroBalance,
  onZeroBalanceToggle,
  testnetEnabled,
  onTestnetToggle,
  arbitrumEnabled,
  onArbitrumToggle,
  baseEnabled,
  onBaseToggle,
  polygonEnabled,
  onPolygonToggle,
}) => {
  const [token, setToken] = useState<FT | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sorting, setSorting] = useState<Sorting>(Sorting.DEFAULT)
  const [isHovered, setIsHovered] = useState(false)
  const [loadingToken, setLoadingToken] = useState<FT | null>(null)
  const isDarkTheme = useDarkTheme()
  const { isViewOnlyMode } = useContext(ProfileContext)
  const [filter, setFilter] = useState<string[]>([])
  const isLoading = isTokensLoading || initedTokens.length === 0

  const handleSorting = () => {
    const nextSorting = {
      [Sorting.DEFAULT]: Sorting.DESCENDING,
      [Sorting.DESCENDING]: Sorting.ASCENDING,
      [Sorting.ASCENDING]: Sorting.DEFAULT,
    }[sorting]

    setSorting(nextSorting)
  }

  const getSortingIcon = () => {
    if (sorting === Sorting.DEFAULT) {
      if (isHovered || isDarkTheme) return SortHoverIcon
      return SortDefaultIcon
    }

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
    const getUSDBalance = (token: (typeof initedTokens)[0]) => {
      const balance = token.getUSDBalance()
      return balance ? new BigNumber(balance) : null
    }

    if (sorting === Sorting.ASCENDING) {
      return [...initedTokens].sort((a, b) => {
        const balanceA = getUSDBalance(a)
        const balanceB = getUSDBalance(b)

        if (balanceA === null) return 1
        if (balanceB === null) return -1

        return balanceA.comparedTo(balanceB) || 0
      })
    }

    if (sorting === Sorting.DESCENDING) {
      return [...initedTokens].sort((a, b) => {
        const balanceA = getUSDBalance(a)
        const balanceB = getUSDBalance(b)

        if (balanceA === null) return 1
        if (balanceB === null) return -1

        return balanceB.comparedTo(balanceA) || 0
      })
    }

    return initedTokens
  }, [initedTokens, sorting])

  const filteredTokens = useMemo(() => {
    if (filter.length === 0) return sortedTokens
    return sortedTokens.filter((token) =>
      filter.includes(`${token.getChainId()}`),
    )
  }, [sortedTokens, filter])

  return (
    <>
      <div className="relative flex flex-col">
        {!isViewOnlyMode && (
          <div className={clsx("flex justify-end mb-1", isLoading && "hidden")}>
            <ChainFilter
              filter={filter}
              setFilter={setFilter}
              iconClassName="w-[24px] h-[24px]"
            />
            <IconCmpPortfolioOptions
              className="ml-5 w-[24px] h-[24px] transition-opacity cursor-pointer hover:opacity-60 dark:text-white bg-transparent"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        )}
        <div className="mb-[20px] overflow-x-auto scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          <table className="w-full text-left">
            <thead className="text-secondary dark:text-zinc-500 h-[40px] hidden md:table-header-group">
              <tr className="text-sm font-bold leading-5">
                <th className="w-[25%] min-w-[100px] pr-[30px]">Name</th>
                <th className="w-[25%] pr-[10px] min-w-[100px]">Category</th>
                <th className="w-[25%] pr-[10px] min-w-[100px]">Price</th>
                <th className="w-[25%] pr-[10px] min-w-[100px]">
                  Token balance
                </th>
                <th
                  className={clsx(
                    "w-[25%] pr-[10px] min-w-[120px]",
                    "cursor-pointer hover:text-gray-500 gap-[6px]",
                  )}
                  onClick={handleSorting}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span className="flex items-center whitespace-nowrap">
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
              {isLoading ? (
                <TableTokenSkeleton
                  tableRowsAmount={5}
                  tableCellAmount={getIsMobileDeviceMatch() ? 2 : 6}
                  hasTbody={false}
                />
              ) : (
                filteredTokens.map((token, index, arr) => (
                  <ActiveToken
                    hideZeroBalance={hideZeroBalance}
                    testnetEnabled={testnetEnabled}
                    arbitrumEnabled={arbitrumEnabled}
                    baseEnabled={baseEnabled}
                    polygonEnabled={polygonEnabled}
                    key={`token_${token.getTokenAddress()}_${token.getTokenState()}_${token.getChainId()}_${index}`}
                    token={token}
                    tokens={allTokens}
                    profileConstants={profileConstants}
                    onSendClick={onSendClick}
                    onSwapClick={onSwapClick}
                    onStakeClick={onStakeClick}
                    setToken={setToken}
                    dropdownPosition={index + 4 > arr.length ? "top" : "bottom"}
                    loadingToken={loadingToken}
                    onConvertToBtc={onConvertToBtc}
                    onConvertToCkBtc={onConvertToCkBtc}
                    onConvertToEth={onConvertToEth}
                    onConvertToCkEth={onConvertToCkEth}
                    onConvertToSepoliaEth={onConvertToSepoliaEth}
                    onConvertToCkSepoliaEth={onConvertToCkSepoliaEth}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isViewOnlyMode && (
          <ManageTokens
            className="mx-auto w-fit"
            tokens={allTokens}
            onSubmitIcrc1Pair={onSubmitIcrc1Pair}
            onFetch={onFetch}
            setLoadingToken={setLoadingToken}
            manageBtnDisabled={isLoading}
          />
        )}
        <PortfolioOptions
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          hideZeroBalance={hideZeroBalance}
          onZeroBalanceToggle={onZeroBalanceToggle}
          testnetEnabled={testnetEnabled}
          onTestnetToggle={onTestnetToggle}
          arbitrumEnabled={arbitrumEnabled}
          onArbitrumToggle={onArbitrumToggle}
          baseEnabled={baseEnabled}
          onBaseToggle={onBaseToggle}
          polygonEnabled={polygonEnabled}
          onPolygonToggle={onPolygonToggle}
        />
      </div>
      <TokenInfoModal token={token} onClose={() => setToken(undefined)} />
    </>
  )
}
