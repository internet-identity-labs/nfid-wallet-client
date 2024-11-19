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
  const filterTokens = useCallback((token: NFT, searchInput: string) => {
    return (
      token
        .getCollectionName()
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
          <ChooseNftItem
            key={`option_${token.getTokenId()}_group_${index}_${index}`}
            token={token}
          />
        )}
      />
    </>
  )
}
