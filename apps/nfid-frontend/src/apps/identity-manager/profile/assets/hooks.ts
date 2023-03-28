import { decodeTokenIdentifier } from "ictool"
import React from "react"
import useSWR from "swr"

import { authState, getWalletName } from "@nfid/integration"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"
import { useEthNFTs } from "frontend/features/fungable-token/eth/hooks/use-eth-nfts"
import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import {
  principalTokens,
  collection,
  tokens,
  token,
} from "frontend/integration/entrepot"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

export function useNFT(tokenId: string) {
  const { canister } = decodeTokenIdentifier(tokenId)
  const _collection = useSWR(
    `collection/${canister}`,
    () => collection(canister),
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )

  const _tokens = useSWR(
    _collection.data ? `collection/${canister}/tokens` : null,
    () => {
      if (!_collection.data) throw new Error("unreachable")
      return tokens(_collection.data)
    },
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )

  return useSWR(
    _collection.data && _tokens.data ? `token/${tokenId}` : null,
    () => {
      if (!_collection.data || !_tokens.data) throw new Error("unreachable")
      const { index } = decodeTokenIdentifier(tokenId)
      return token(_collection.data, _tokens.data, index)
    },
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )
}

export const useAllNFTs = () => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const { nfts: ethNFTS } = useEthNFTs()
  const { address } = useEthAddress()

  const { data, isLoading, isValidating } = useSWR(
    principals ? [principals, "userTokens"] : null,
    ([principals]) => principalTokens(principals),
    {
      dedupingInterval: 60_000 * 5,
      focusThrottleInterval: 60_000 * 5,
      revalidateIfStale: false,
    },
  )

  const nfts = React.useMemo(() => {
    if (!data || !applicationsMeta) return []

    return data
      .map(({ principal, account, ...rest }) => ({
        principal,
        account,
        walletName: getWalletName(
          applicationsMeta,
          principal.toString(),
          account.accountId,
        ),
        contractId: rest.canisterId,
        owner: principal?.toText(),
        ...rest,
      }))
      .concat(
        // I have not found decoded data for NFT
        // Mocking for rarible demo
        // @ts-ignore
        (ethNFTS?.map(
          (nft) =>
            ({
              index: nft.id,
              contractId: nft.contract,
              owner: address,
              tokenId: nft.tokenId,
              account: {
                domain: "nfid.one",
                label: "",
                accountId: "0",
                alias: [
                  "https://nfid.one",
                  "https://3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app",
                ],
              },
              assetFullsize: { url: nft?.image, format: "img" },
              assetPreview: nft?.thumbnail,
              blockchain: "Ethereum",
              collection: {
                description: nft.description,
                id: nft.collection,
                name: nft.contractName,
                standard: nft.tokenType,
              },
              name: nft.title,
              principal: authState.get().delegationIdentity?.getPrincipal(),
            } as UserNonFungibleToken),
        ) as any) ?? [],
      )
  }, [data, applicationsMeta, ethNFTS, address])
  return { nfts, isLoading: isLoading || isValidating }
}
