import { useCallback, useMemo } from "react"

import { FT } from "frontend/integration/ft/ft"

import { ChooseFtItem } from "./choose-ft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseFtModal {
  searchInputId: string
  tokens: FT[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
  isSwapTo?: boolean
}

export const ChooseFtModal = ({
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
  isSwapTo,
}: IChooseFtModal) => {
  const sortedTokens = useMemo(() => {
    if (isSwapTo) {
      return [...tokens].sort((a, b) => {
        const aIsSwappable = "getIsSwappableTo" in a && a.getIsSwappableTo()
        const bIsSwappable = "getIsSwappableTo" in b && b.getIsSwappableTo()

        if (aIsSwappable && !bIsSwappable) return -1
        if (!aIsSwappable && bIsSwappable) return 1
        return 0
      })
    } else {
      return [...tokens].sort((a, b) => {
        const aIsSwappable = "getIsSwappableFrom" in a && a.getIsSwappableFrom()
        const bIsSwappable = "getIsSwappableFrom" in b && b.getIsSwappableFrom()

        if (aIsSwappable && !bIsSwappable) return -1
        if (!aIsSwappable && bIsSwappable) return 1
        return 0
      })
    }
  }, [tokens, isSwapTo])

  const filterTokensBySearchInput = useCallback(
    (token: FT, searchInput: string) => {
      return (
        token
          .getTokenSymbol()
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        token.getTokenName().toLowerCase().includes(searchInput.toLowerCase())
      )
    },
    [],
  )

  const handleSelectTokenId = useCallback((token: FT) => {
    return token.getTokenAddress()
  }, [])

  return (
    <>
      <ChooseTokenModal
        searchInputId={searchInputId}
        tokens={sortedTokens}
        title={title}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={(value) => onSelect(handleSelectTokenId(value))}
        trigger={trigger}
        renderItem={ChooseFtItem}
        isSwapTo={isSwapTo}
      />
    </>
  )
}
