import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { ChooseTokenSkeleton, IconCmpWarning } from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow, Label, Tooltip } from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

import { useIntersectionObserver } from "../../organisms/send-receive/hooks/intersection-observer"
import { getUserPrincipalId } from "../../organisms/tokens/utils"
import { ChooseItem } from "./choose-ft-item"

const INITED_TOKENS_LIMIT = 6

export interface IChooseFtModal {
  options: FT[]
  preselectedValue?: string
  onSelect?: (value: string) => void
  warningText?: string | JSX.Element
  label?: string
  title: string
  trigger?: JSX.Element
  isSmooth?: boolean
}

export const ChooseFtModal = ({
  options,
  preselectedValue,
  onSelect,
  warningText,
  title,
  label,
  trigger,
  isSmooth = false,
}: IChooseFtModal) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedValue, setSelectedValue] = useState(preselectedValue ?? "")
  const [tokensOptions, setTokensOptions] = useState<FT[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(false)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const init = async () => {
      setIsTokenOptionsLoading(true)
      const { publicKey } = await getUserPrincipalId()

      const tokenOptions = await Promise.all(
        options.map((token, index) => {
          return index < INITED_TOKENS_LIMIT
            ? token.init(Principal.fromText(publicKey))
            : token
        }),
      )

      setTokensOptions(tokenOptions)
      setIsTokenOptionsLoading(false)
    }

    init()
  }, [])

  const filteredTokens = useMemo(() => {
    if (searchInput.length < 2) return tokensOptions

    return tokensOptions.filter(
      (token) =>
        token
          .getTokenSymbol()
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        token.getTokenName().toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [tokensOptions, searchInput])

  useIntersectionObserver(itemRefs.current, async (index) => {
    const originalIndex = options.findIndex(
      (token) => token === filteredTokens[index],
    )

    if (originalIndex !== -1 && !options[originalIndex].isInited()) {
      const { publicKey } = await getUserPrincipalId()

      const updatedToken = await options[originalIndex].init(
        Principal.fromText(publicKey),
      )

      setTokensOptions((prev) => {
        const newOptions = prev.map((token, i) =>
          i === originalIndex ? updatedToken : token,
        )
        return newOptions
      })
    }
  })

  const handleSelect = useCallback((token: FT) => {
    setSelectedValue(token.getTokenAddress())

    setTimeout(
      () => {
        setIsModalVisible(false)
      },
      isSmooth ? 100 : 0,
    )
  }, [])

  useEffect(() => {
    onSelect && onSelect(selectedValue)
  }, [selectedValue])

  return (
    <div className="flex flex-col shrink-0" id={"choose_modal"}>
      {label && <Label className="mb-1">{label}</Label>}
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
          {warningText && (
            <Tooltip tip={warningText}>
              <IconCmpWarning className="cursor-help hover:opacity-70 text-orange" />
            </Tooltip>
          )}
        </div>
        <Input
          type="text"
          placeholder="Search by token name"
          inputClassName="!border-black"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        {isTokenOptionsLoading && <ChooseTokenSkeleton rows={6} />}
        <div
          className={clsx(
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
          )}
        >
          {filteredTokens.map((token, index) => (
            <div
              id={`option_${token.getTokenSymbol().replace(/\s/g, "")}`}
              key={`group_${token.getTokenSymbol()}_${token.getTokenName()}_${index}`}
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <ChooseItem
                key={`option_${token.getTokenAddress()}_group_${index}_${index}`}
                handleClick={() => handleSelect(token)}
                token={token}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
