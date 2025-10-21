import { useCallback } from "react"

import { NFT } from "frontend/integration/nft/nft"

import { ChooseNftItem } from "./choose-nft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseNftModal {
  tokens: NFT[]
  onSelect: (value: string) => void
  title: string
  trigger?: JSX.Element
}

export const ChooseNftModal = ({
  tokens,
  onSelect,
  title,
  trigger,
}: IChooseNftModal) => {
  const filterTokensBySearchInput = useCallback(
    (token: NFT, searchInput: string) => {
      return (
        token
          .getCollectionName()
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        token.getTokenName().toLowerCase().includes(searchInput.toLowerCase())
      )
    },
    [],
  )

  const handleSelectTokenId = useCallback((token: NFT) => {
    return token.getTokenId()
  }, [])

  return (
    <>
      <ChooseTokenModal
        id="choose-nft"
        tokens={tokens}
        title={title}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={(value) => onSelect(handleSelectTokenId(value))}
        trigger={trigger}
        renderItem={ChooseNftItem}
        tokensAvailableToSwap={{ to: [], from: [] }}
      />
    </>
  )
}
