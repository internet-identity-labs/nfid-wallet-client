import { useCallback } from "react"

import { FT } from "frontend/integration/ft/ft"

import { ChooseFtItem } from "./choose-ft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseFtModal {
  tokens: FT[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
}

export const ChooseFtModal = ({
  tokens,
  onSelect,
  title,
  trigger,
}: IChooseFtModal) => {
  const filterTokens = useCallback((token: FT, searchInput: string) => {
    return (
      token
        .getTokenSymbol()
        .toLowerCase()
        .includes(searchInput.toLowerCase()) ||
      token.getTokenName().toLowerCase().includes(searchInput.toLowerCase())
    )
  }, [])

  return (
    <>
      <ChooseTokenModal
        tokens={tokens}
        title={title}
        filter={filterTokens}
        onSelect={onSelect}
        trigger={trigger}
        renderItem={(token, index) => (
          <ChooseFtItem
            key={`option_${token.getTokenAddress()}_group_${index}`}
            token={token}
          />
        )}
      />
    </>
  )
}
