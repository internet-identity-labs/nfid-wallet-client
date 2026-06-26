import { Principal } from "@icp-sdk/core/principal"
import { debounce } from "@nfid-frontend/utils"
import clsx from "clsx"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ElementType,
} from "react"
import { IoIosSearch } from "react-icons/io"

import {
  ChooseTokenSkeleton,
  IconInfo,
  IconInfoDark,
  Tooltip,
} from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { useDarkTheme } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"
import { FTImpl } from "frontend/integration/ft/impl/ft-impl"
import { NFT } from "frontend/integration/nft/nft"

import { useIntersectionObserver } from "../../organisms/send-receive/hooks/intersection-observer"
import { BTC_NATIVE_ID, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { IModalType } from "../../organisms/send-receive/utils"
import { ChainFilter } from "../../organisms/tokens/components/chain-filter"
import { Category, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"

const INITED_TOKENS_LIMIT = 6

export interface IChooseTokenModal<T> {
  id: string
  searchInputId?: string
  tokens: T[]
  onSelect: (value: T) => void
  title: string
  trigger?: JSX.Element
  filterTokensBySearchInput: (token: T, searchInput: string) => boolean
  renderItem: ElementType<{
    token: T
    isTargetList?: boolean
    tokensAvailableToSwap?: TokensAvailableToSwap
    isBtcEthLoading?: boolean
  }>
  isTargetList?: boolean
  tokensAvailableToSwap?: TokensAvailableToSwap
  isBtcEthLoading?: boolean
  modalType?: IModalType
  tooltipText?: string
}

export const ChooseTokenModal = <T extends FT | NFT>({
  id,
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
  filterTokensBySearchInput,
  renderItem: ChooseItem,
  isTargetList,
  tokensAvailableToSwap,
  isBtcEthLoading,
  modalType,
  tooltipText,
}: IChooseTokenModal<T>) => {
  const isDarkTheme = useDarkTheme()
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tokensOptions, setTokensOptions] = useState<T[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(true)
  const [filter, setFilter] = useState<string[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const initingRef = useRef<Set<string>>(new Set())

  const handleSearch = useCallback((value: string) => {
    const debounced = debounce((val: string) => setSearchInput(val), 300)
    debounced(value)
  }, [])

  useEffect(() => {
    if (!isTargetList) {
      setTokensOptions(tokens)
      setIsTokenOptionsLoading(false)
      return
    }

    const init = async () => {
      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)

      try {
        const tokenOptions = await Promise.all(
          tokens.map(async (token, index) => {
            if (index < INITED_TOKENS_LIMIT) {
              try {
                const reinit =
                  token instanceof FTImpl && isEvmToken(token.getChainId())
                    ? await ethereumService.getQuickAddress()
                    : undefined
                await token.init(principal, reinit)
                return token
              } catch (error) {
                console.error("Error during token initialization:", error)
                return null
              }
            }
            return token
          }),
        )

        setTokensOptions(tokenOptions.filter(Boolean) as T[])
      } catch (error) {
        console.error("Error during tokens initialization:", error)
      } finally {
        setIsTokenOptionsLoading(false)
      }
    }

    init()
  }, [tokens, isTargetList])

  const filteredTokens = useMemo(() => {
    let result = tokensOptions

    if (filter.length > 0) {
      result = result.filter((token) => {
        const chainId =
          token instanceof FTImpl ? String(token.getChainId()) : null

        if (!chainId) return false

        return filter.includes(chainId)
      })
    }

    if (searchInput.length >= 2) {
      result = result.filter((token) =>
        filterTokensBySearchInput(token, searchInput),
      )
    }

    return result
  }, [tokensOptions, searchInput, filter, filterTokensBySearchInput])

  const onIntersect = useCallback(
    async (index: number) => {
      const token = filteredTokens[index]
      if (!token || !(token instanceof FTImpl) || token.isInited()) return

      const tokenKey = `${token.getChainId()}:${token.getTokenAddress()}`
      if (initingRef.current.has(tokenKey)) return
      initingRef.current.add(tokenKey)

      try {
        const { publicKey } = authState.getUserIdData()
        const reinit = isEvmToken(token.getChainId())
          ? await ethereumService.getQuickAddress()
          : undefined
        const updatedToken = await token.init(
          Principal.fromText(publicKey),
          reinit,
        )

        setTokensOptions((prev) => {
          const newOptions = [...prev]
          const tokenIndex = prev.findIndex(
            (t) =>
              t instanceof FTImpl &&
              t.getTokenAddress() === token.getTokenAddress() &&
              t.getChainId() === token.getChainId(),
          )
          if (tokenIndex !== -1) newOptions[tokenIndex] = updatedToken as T
          return newOptions
        })
      } catch (e) {
        console.debug(`Failed to init token ${tokenKey}:`, e)
      } finally {
        initingRef.current.delete(tokenKey)
      }
    },
    [filteredTokens],
  )

  useIntersectionObserver(itemRefs.current, !!isTargetList, onIntersect)

  const handleSelect = (token: T) => {
    if (token instanceof FTImpl) {
      const isSwappable = isTargetList
        ? tokensAvailableToSwap?.to.includes(token.getTokenAddress())
        : tokensAvailableToSwap?.from.includes(token.getTokenAddress())

      if (!isSwappable && tokensAvailableToSwap) return
      if (
        isBtcEthLoading &&
        (token.getTokenAddress() === BTC_NATIVE_ID ||
          token.getTokenAddress() === ETH_NATIVE_ID ||
          token.getTokenCategory() === Category.ERC20)
      )
        return
    }
    onSelect?.(token)
    setIsModalVisible(false)
  }

  return (
    <div id={"choose_modal"}>
      <div onClick={() => setIsModalVisible(true)}>{trigger}</div>
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor dark:bg-darkGray",
          "flex flex-col rounded-[24px]",
          !isModalVisible && "hidden",
        )}
      >
        <div>
          <div className="flex items-center w-full">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalVisible(false)}
            >
              <IconCmpArrow className="mr-2" />
            </div>
            <div className="flex items-center justify-between w-full">
              <p id={id} className="text-xl font-bold leading-10">
                {title}
              </p>
              {tooltipText && (
                <Tooltip
                  align="end"
                  alignOffset={-20}
                  tip={
                    <span className="block max-w-[320px]">{tooltipText}</span>
                  }
                >
                  <img
                    src={isDarkTheme ? IconInfoDark : IconInfo}
                    alt="icon"
                    className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        {searchInputId && (
          <div className="relative">
            <Input
              id={searchInputId}
              type="text"
              placeholder="Search by token name"
              inputClassName="!border-black dark:!border-zinc-500"
              icon={
                <IoIosSearch
                  size="20"
                  className="text-gray-400 dark:text-zinc-500"
                />
              }
              onKeyUp={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
              className="mt-4 mb-5"
            />
            {modalType === IModalType.SEND && (
              <div className="absolute right-[10px] top-0 bottom-0 my-auto w-5 h-5">
                <ChainFilter filter={filter} setFilter={setFilter} />
              </div>
            )}
          </div>
        )}

        {isTokenOptionsLoading && (
          <div className={clsx(!searchInputId && "mt-4")}>
            <ChooseTokenSkeleton rows={6} />
          </div>
        )}
        {!tokensOptions.length && !isTokenOptionsLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-zinc-500">
            No tokens available yet
          </div>
        ) : (
          <div
            className={clsx(
              "flex-1 overflow-auto snap-end pr-[10px]",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
              "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-[#242427]",
              !searchInputId && "mt-4",
            )}
          >
            {filteredTokens.map((token, index) => (
              <div
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleSelect(token)}
                key={`${token.getTokenName()}_${index}`}
              >
                <ChooseItem
                  token={token}
                  isTargetList={isTargetList}
                  tokensAvailableToSwap={tokensAvailableToSwap}
                  isBtcEthLoading={isBtcEthLoading}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
