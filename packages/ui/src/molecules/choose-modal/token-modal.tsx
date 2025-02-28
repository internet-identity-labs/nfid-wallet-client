import { Principal } from "@dfinity/principal"
import { debounce } from "@dfinity/utils"
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

import { ChooseTokenSkeleton, IconInfo, Tooltip } from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"
import { FTImpl } from "frontend/integration/ft/impl/ft-impl"
import { NFT } from "frontend/integration/nft/nft"

import { useIntersectionObserver } from "../../organisms/send-receive/hooks/intersection-observer"

const INITED_TOKENS_LIMIT = 6

export interface IChooseTokenModal<T> {
  searchInputId?: string
  tokens: T[]
  onSelect: (value: T) => void
  title: string
  trigger?: JSX.Element
  filterTokensBySearchInput: (token: T, searchInput: string) => boolean
  renderItem: ElementType<{
    token: T
    isSwapTo?: boolean
    tokensAvailableToSwap: TokensAvailableToSwap
  }>
  isSwapTo?: boolean
  tokensAvailableToSwap: TokensAvailableToSwap
}

export const ChooseTokenModal = <T extends FT | NFT>({
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
  filterTokensBySearchInput,
  renderItem: ChooseItem,
  isSwapTo,
  tokensAvailableToSwap,
}: IChooseTokenModal<T>) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tokensOptions, setTokensOptions] = useState<T[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(true)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleSearch = useCallback(
    debounce((value: string) => setSearchInput(value), 300),
    [],
  )

  useEffect(() => {
    const init = async () => {
      const { publicKey } = authState.getUserIdData()

      try {
        const tokenOptions = await Promise.all(
          tokens.map(async (token, index) => {
            if (index < INITED_TOKENS_LIMIT && !token.isInited()) {
              try {
                await token.init(Principal.fromText(publicKey))
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
  }, [tokens])

  const filteredTokens = useMemo(() => {
    if (searchInput.length < 2) return tokensOptions

    return tokensOptions.filter((token) =>
      filterTokensBySearchInput(token, searchInput),
    )
  }, [tokensOptions, searchInput])

  useIntersectionObserver(itemRefs.current, async (index) => {
    const token = filteredTokens[index]

    if (token && !token.isInited()) {
      const { publicKey } = authState.getUserIdData()

      const updatedToken = await token.init(Principal.fromText(publicKey))

      setTokensOptions((prev) => {
        const newOptions = [...prev]
        const tokenIndex = prev.findIndex((t) => t === token)

        if (tokenIndex !== -1) {
          newOptions[tokenIndex] = updatedToken as T
        }

        return newOptions
      })
    }
  })

  const handleSelect = useCallback(
    (token: T) => {
      if (token instanceof FTImpl) {
        const isSwappable = isSwapTo
          ? tokensAvailableToSwap.to.includes(token.getTokenAddress())
          : tokensAvailableToSwap.from.includes(token.getTokenAddress())

        if (!isSwappable) return
      }
      onSelect?.(token)
      setIsModalVisible(false)
    },
    [onSelect, tokensAvailableToSwap, isSwapTo],
  )

  return (
    <div id={"choose_modal"}>
      <div onClick={() => setIsModalVisible(true)}>{trigger}</div>
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
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
              <p className="text-xl font-bold leading-10">{title}</p>
              <Tooltip
                align="end"
                alignOffset={-20}
                tip={
                  <span className="block max-w-[320px]">
                    Tokens that can't be selected lack enough liquidity for
                    swapping.
                  </span>
                }
              >
                <img
                  src={IconInfo}
                  alt="icon"
                  className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <Input
          id={searchInputId}
          type="text"
          placeholder="Search by token name"
          inputClassName="!border-black"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => handleSearch((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        {isTokenOptionsLoading && <ChooseTokenSkeleton rows={6} />}
        {!tokensOptions.length && !isTokenOptionsLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No tokens available yet
          </div>
        ) : (
          <div
            className={clsx(
              "flex-1 overflow-auto snap-end pr-[10px]",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
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
                  isSwapTo={isSwapTo}
                  tokensAvailableToSwap={tokensAvailableToSwap}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
