import { useCallback, useMemo } from "react"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { ChooseFtItem } from "./choose-ft-item"
import { ChooseTokenModal } from "./token-modal"
import { IModalType } from "../../organisms/send-receive/utils"
import { SelectedToken } from "frontend/features/transfer-modal/types"

export interface IChooseFtModal {
  id: string
  searchInputId?: string
  tokens: FT[]
  onSelect: (value: SelectedToken) => void
  title: string
  trigger?: JSX.Element
  isTargetList?: boolean
  tokensAvailableToSwap?: TokensAvailableToSwap
  isBtcEthLoading?: boolean
  modalType?: IModalType
  tooltipText?: string
}

export const ChooseFtModal = ({
  id,
  searchInputId,
  tokens,
  onSelect,
  title,
  trigger,
  isTargetList,
  tokensAvailableToSwap,
  isBtcEthLoading,
  modalType,
  tooltipText,
}: IChooseFtModal) => {
  const sortedTokens = useMemo(() => {
    if (!tokensAvailableToSwap) return tokens
    const getIsSwappable = (token: FT) =>
      isTargetList
        ? tokensAvailableToSwap.to.includes(token.getTokenAddress())
        : tokensAvailableToSwap.from.includes(token.getTokenAddress())

    return [...tokens].sort((a, b) => {
      const aIsSwappable = getIsSwappable(a)
      const bIsSwappable = getIsSwappable(b)

      if (aIsSwappable && !bIsSwappable) return -1
      if (!aIsSwappable && bIsSwappable) return 1
      return 0
    })
  }, [tokens, isTargetList, tokensAvailableToSwap])

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
    return {
      address: token.getTokenAddress(),
      chainId: token.getChainId(),
    }
  }, [])

  return (
    <>
      <ChooseTokenModal
        id={id}
        searchInputId={searchInputId}
        tokens={sortedTokens}
        title={title}
        tooltipText={tooltipText}
        filterTokensBySearchInput={filterTokensBySearchInput}
        onSelect={(value) => onSelect(handleSelectTokenId(value))}
        trigger={trigger}
        renderItem={ChooseFtItem}
        isTargetList={isTargetList}
        tokensAvailableToSwap={tokensAvailableToSwap}
        isBtcEthLoading={isBtcEthLoading}
        modalType={modalType}
      />
    </>
  )
}
