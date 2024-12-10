import { useCallback } from "react"

import { FT } from "frontend/integration/ft/ft"

import { ChooseFtItem } from "./choose-ft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseFtModal {
  searchInputId: string
  tokens: FT[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
}

export const ChooseFtModal = ({
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
}: IChooseFtModal) => {
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
        tokens={tokens}
        title={title}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={(value) => onSelect(handleSelectTokenId(value))}
        trigger={trigger}
        renderItem={ChooseFtItem}
      />
    </>
  )
}
