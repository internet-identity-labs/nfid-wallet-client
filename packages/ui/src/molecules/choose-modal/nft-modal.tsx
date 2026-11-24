/* eslint-disable @nx/enforce-module-boundaries */
import { useCallback, JSX } from "react"

import { NFT } from "frontend/integration/nft/nft"

import { ChooseNftItem } from "./choose-nft-item"
import { ChooseTokenModal } from "./token-modal"

export interface IChooseNftModal {
  tokens: NFT[]
  onSelect: (nft: NFT) => void
  title: string
  trigger?: JSX.Element
  listedNftKeys?: Set<string>
  isSendNft?: boolean
  isMarketplace?: boolean
  searchInputId?: string
}

export const ChooseNftModal = ({
  tokens,
  onSelect,
  title,
  trigger,
  listedNftKeys,
  isSendNft,
  isMarketplace,
  searchInputId,
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

  const ChooseNftItemWithStatus = useCallback(
    ({ token }: { token: NFT }) => (
      <ChooseNftItem
        isSendNft={isSendNft}
        token={token}
        isListed={listedNftKeys?.has(
          `${token.getCollectionId()}:${token.getTokenId()}`,
        )}
        isTradable={token.isTradable()}
      />
    ),
    [listedNftKeys, isSendNft],
  )

  const isDisabled = useCallback(
    (nft: NFT) => {
      if (isSendNft) return false

      return (
        !nft.isTradable() ||
        (listedNftKeys?.has(`${nft.getCollectionId()}:${nft.getTokenId()}`) ??
          false)
      )
    },
    [listedNftKeys],
  )

  return (
    <>
      <ChooseTokenModal
        id="choose-nft"
        tokens={tokens}
        title={title}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={onSelect}
        trigger={trigger}
        renderItem={ChooseNftItemWithStatus}
        tokensAvailableToSwap={{ to: [], from: [] }}
        isDisabled={isDisabled}
        isMarketplace={isMarketplace}
        searchInputId={searchInputId}
      />
    </>
  )
}
