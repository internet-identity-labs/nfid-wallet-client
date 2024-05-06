import { decodeTokenIdentifier } from "ictool"
import React from "react"
import ICPLogo from "src/assets/dfinity.svg"
import { useNFTConfig } from "src/ui/connnector/non-fungible-asset-screen/hooks/use-nft-token"
import { nftFactory } from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset-factory"
import { AssetFilter } from "src/ui/connnector/types"
import useSWR from "swr"

import { getWalletName } from "@nfid/integration"

import {
  collection,
  link,
  principalTokens,
  token,
  tokens,
} from "frontend/integration/entrepot"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"

// export function useCredentials () {
//   const key = await getPublicKey(
//     authState.get().delegationIdentity!,
//     Chain.IC
//   );
//   const principal = Ed25519KeyIdentity.fromParsedJson([
//     key,
//     "0",
//   ]).getPrincipal();
//   const root = account.data[0]?.principal_id!;
// }

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
  const supportedBlockchains = nftFactory.getKeys()
  const { configs: tokens } = useNFTConfig({
    assetFilters: assetFilter ?? [],
    blockchains: supportedBlockchains,
  })
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const { data, isLoading } = useSWR(
    principals ? ["userTokens", principals] : null,
    ([key, principals]) => principalTokens(principals),
    {
      revalidateOnFocus: true,
    },
  )

  const nfts = React.useMemo(() => {
    if (!applicationsMeta) return []

    return data
      ?.map(({ principal, account, collection, index, ...rest }) => ({
        principal,
        account,
        walletName: getWalletName(
          applicationsMeta,
          account.domain,
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
  return { nfts, isLoading: isLoading }
}
