import { Principal } from "@dfinity/principal"
import { debounce } from "@dfinity/utils"
import clsx from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { ChooseTokenSkeleton } from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow } from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { NFT } from "frontend/integration/nft/nft"

import { useIntersectionObserver } from "../../organisms/send-receive/hooks/intersection-observer"
import { getUserPrincipalId } from "../../organisms/tokens/utils"

const INITED_TOKENS_LIMIT = 6

export interface IChooseTokenModal<T> {
  tokens: T[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
  filter: (token: T, searchInput: string) => boolean
  renderItem: (token: T, index: number) => JSX.Element
}

export const ChooseTokenModal = <T extends FT | NFT>({
  tokens,
  onSelect,
  title,
  trigger,
  filter,
  renderItem,
}: IChooseTokenModal<T>) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tokensOptions, setTokensOptions] = useState<T[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(false)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleSearch = useCallback(
    debounce((value: string) => setSearchInput(value), 300),
    [],
  )

  useEffect(() => {
    const init = async () => {
      setIsTokenOptionsLoading(true)
      const { publicKey } = await getUserPrincipalId()

      const tokenOptions = await Promise.all(
        tokens.map((token, index) => {
          return index < INITED_TOKENS_LIMIT && !token.isInited()
            ? token.init(Principal.fromText(publicKey))
            : token
        }),
      )

      setTokensOptions(tokenOptions as T[])
      setIsTokenOptionsLoading(false)
    }

    init()
  }, [tokens])

  const filteredTokens = useMemo(() => {
    if (searchInput.length < 2) return tokensOptions

    return tokensOptions.filter((token) => filter(token, searchInput))
  }, [tokensOptions, searchInput])

  useIntersectionObserver(itemRefs.current, async (index) => {
    const token = filteredTokens[index]

    if (token && !token.isInited()) {
      const { publicKey } = await getUserPrincipalId()

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
      let tokenValue: string

      if ("getTokenAddress" in token) {
        tokenValue = token.getTokenAddress()
      } else {
        tokenValue = token.getTokenId()
      }

      onSelect && onSelect(tokenValue)
      setIsModalVisible(false)
    },
    [onSelect],
  )

  return (
    <div className="flex flex-col shrink-0" id={"choose_modal"}>
      <div className="flex shrink-0" onClick={() => setIsModalVisible(true)}>
        {trigger}
      </div>
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
          "flex flex-col rounded-xl",
          !isModalVisible && "hidden",
        )}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalVisible(false)}
            >
              <IconCmpArrow className="mr-2" />
            </div>
            <p className="text-xl font-bold leading-10">{title}</p>
          </div>
        </div>
        <Input
          type="text"
          placeholder="Search by token name"
          inputClassName="!border-black"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => handleSearch((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        {isTokenOptionsLoading && <ChooseTokenSkeleton rows={6} />}
        {!tokensOptions.length ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            You don’t own any collectibles yet
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
                key={`group_${token.getTokenName()}_${index}`}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleSelect(token)}
              >
                {renderItem(token, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}