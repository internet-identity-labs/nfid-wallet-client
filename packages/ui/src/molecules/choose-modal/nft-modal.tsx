import clsx from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { ChooseTokenSkeleton, IconCmpWarning } from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow, Label, Tooltip } from "@nfid-frontend/ui"

import { NFT } from "frontend/integration/nft/nft"

import { useIntersectionObserver } from "../../organisms/send-receive/hooks/intersection-observer"
import { ChooseNftItem } from "./choose-nft-item"

const INITED_TOKENS_LIMIT = 6

export interface IChooseNftModal {
  options: NFT[]
  preselectedValue?: string
  onSelect?: (value: string) => void
  warningText?: string | JSX.Element
  label?: string
  title: string
  trigger?: JSX.Element
  isSmooth?: boolean
}

export const ChooseNFtModal = ({
  options,
  preselectedValue,
  onSelect,
  warningText,
  title,
  label,
  trigger,
  isSmooth = false,
}: IChooseNftModal) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedValue, setSelectedValue] = useState(preselectedValue ?? "")
  const [nftsOptions, setNftsOptions] = useState<NFT[]>([])
  const [isNftOptionsLoading, setIsNftOptionsLoading] = useState(false)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const init = async () => {
      setIsNftOptionsLoading(true)

      const nftsOptions = await Promise.all(
        options.map((token, index) => {
          return index < INITED_TOKENS_LIMIT ? token.init() : token
        }),
      )

      setNftsOptions(nftsOptions)
      setIsNftOptionsLoading(false)
    }

    init()
  }, [options])

  const filteredNfts = useMemo(() => {
    if (searchInput.length < 2) return nftsOptions

    return nftsOptions.filter(
      (nft) =>
        nft
          .getCollectionName()
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        nft.getTokenName().toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [nftsOptions, searchInput])

  useIntersectionObserver(itemRefs.current, async (index) => {
    const originalIndex = options.findIndex(
      (nft) => nft === filteredNfts[index],
    )

    if (originalIndex !== -1 && !options[originalIndex].isInited()) {
      const updatedNft = await options[originalIndex].init()

      setNftsOptions((prev) => {
        const newOptions = prev.map((nft, i) =>
          i === originalIndex ? updatedNft : nft,
        )
        return [...new Set(newOptions)]
      })
    }
  })

  const handleSelect = useCallback((token: NFT) => {
    setSelectedValue(token.getTokenId())

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
          placeholder="Search"
          inputClassName="!border-black"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        {isNftOptionsLoading && <ChooseTokenSkeleton rows={6} />}
        <div
          className={clsx(
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
          )}
        >
          {filteredNfts.map((nft, index) => (
            <div
              id={`option_${nft.getTokenName().replace(/\s/g, "")}`}
              key={`group_${nft.getCollectionId()}_${nft.getTokenName()}_${index}`}
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <ChooseNftItem
                key={`option_${nft.getTokenId()}_group_${index}_${index}`}
                handleClick={() => handleSelect(nft)}
                token={nft}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
