import { useCallback, useMemo } from "react"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { ChooseFtItem } from "./choose-ft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseFtModal {
  id: string
  searchInputId: string
  tokens: FT[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
  isSwapTo?: boolean
  tokensAvailableToSwap?: TokensAvailableToSwap
}

export const ChooseFtModal = ({
  id,
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
  isSwapTo,
  tokensAvailableToSwap,
}: IChooseFtModal) => {
  const sortedTokens = useMemo(() => {
    if (!tokensAvailableToSwap) return tokens
    const getIsSwappable = (token: FT) =>
      isSwapTo
        ? tokensAvailableToSwap.to.includes(token.getTokenAddress())
        : tokensAvailableToSwap.from.includes(token.getTokenAddress())

    return [...tokens].sort((a, b) => {
      const aIsSwappable = getIsSwappable(a)
      const bIsSwappable = getIsSwappable(b)

      if (aIsSwappable && !bIsSwappable) return -1
      if (!aIsSwappable && bIsSwappable) return 1
      return 0
    })
  }, [tokens, isSwapTo, tokensAvailableToSwap])

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
        id={id}
        searchInputId={searchInputId}
        tokens={sortedTokens}
        title={title}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={(value) => onSelect(handleSelectTokenId(value))}
        trigger={trigger}
        renderItem={ChooseFtItem}
        isSwapTo={isSwapTo}
        tokensAvailableToSwap={tokensAvailableToSwap}
      />
    </>
  )
}
