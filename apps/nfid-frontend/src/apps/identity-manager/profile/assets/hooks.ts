import {decodeTokenIdentifier} from "ictool"
import React from "react"
import useSWR from "swr"

import {getWalletName} from "@nfid/integration"
import {collection, link, principalTokens, token, tokens,} from "frontend/integration/entrepot"
import {useApplicationsMeta, useProfile,} from "frontend/integration/identity-manager/queries"
import {useAllPrincipals} from "frontend/integration/internet-identity/queries"
import {useWalletDelegation} from "frontend/integration/wallet/hooks/use-wallet-delegation"
import {AssetFilter, Blockchain} from "src/ui/connnector/types";
import {useNFTConfig} from "src/ui/connnector/non-fungible-asset-screen/hooks/use-nft-token";
import ICPLogo from "src/assets/dfinity.svg";

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

export const useAllNFTs = (assetFilter?: AssetFilter[]) => {
  const {configs: tokens} = useNFTConfig({assetFilters: assetFilter ?? [],
    blockchains: [Blockchain.POLYGON, Blockchain.ETHEREUM]})
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const { profile } = useProfile()
  const { data: delegation } = useWalletDelegation(
    profile?.anchor,
    "nfid.one",
    "0",
  )
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
      .map(({ principal, account, collection, index , ...rest }) => ({
        principal,
        account,
        walletName: getWalletName(
          applicationsMeta,
          principal.toString(),
          account.accountId,
        ),
        contractId: rest.canisterId,
        owner: principal?.toText(),
        clipboardText: link(collection.id, Number(index)),
        collection,
        index,
        blockchainLogo: ICPLogo,
        ...rest,
      }))
      .filter((nft) =>
        !assetFilter?.length
          ? true
          : !!assetFilter.find((f) => f.principal === nft.principal.toString()),
      )
      .concat(tokens as any)
  }, [data, applicationsMeta, assetFilter, tokens])
  return { nfts, isLoading: isLoading || isValidating }
}
