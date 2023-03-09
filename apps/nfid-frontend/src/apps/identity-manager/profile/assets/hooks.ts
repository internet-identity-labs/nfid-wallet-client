import { decodeTokenIdentifier } from "ictool"
import React from "react"
import useSWR from "swr"

import { authState, getWalletName } from "@nfid/integration"

import { useEthNFTs } from "frontend/features/fungable-token/eth/hooks/use-eth-nfts"
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
        ...rest,
      }))
      .concat(
        // I have not found decoded data for NFT
        // Mocking for rarible demo
        // @ts-ignore
        ethNFTS?.map((nft) => ({
          principal: authState.get().delegationIdentity?.getPrincipal(),
          account: {
            domain: "nfid.one",
            label: "",
            accountId: "0",
            alias: [
              "https://nfid.one",
              "https://3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app",
            ],
          },
          walletName: "NFID account 1",
          collection: {
            id: "zhibq-piaaa-aaaah-qcvka-cai",
            priority: 10,
            name: nft?.contractName,
            brief: "9999 beautiful and striking NFTs",
            description:
              "Panda Queen is a bold and gorgeous artwork drawn in a unique fine-art comic style by artist Mark Sarmel.",
            blurb:
              "Welcome to the Animal Guardians universe! The mission of Animal Guardians is to promote the prevention of animal abuse by building a vibrant community of NFT enthusiasts that love animals. Hodling a Panda Queen NFT will grant you access to a unique role in our DSCVR portal that will be used to provide benefits such as airdrops from future Animal Guardians collections. 30% of initial sales go to rolda.org to save stray dogs. 5% of initial sales go to the World Wildlife fund to save tigers, pandas, and other wild animals.",
            keywords: "Animals Art Comic",
            web: "https://www.animalguardians.io",
            telegram: "",
            discord: "https://discord.gg/animalg",
            twitter: "https://www.twitter.com/animal_guard1",
            medium: "",
            dscvr: "",
            distrikt: "",
            banner:
              "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=628",
            avatar:
              "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=627",
            collection:
              "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=629",
            route: "pandaqueen",
            commission: 0.035,
            legacy: "",
            unit: "NFT",
            nftv: true,
            mature: false,
            market: true,
            dev: false,
            external: false,
            filter: false,
            sale: false,
            earn: false,
            saletype: "v1",
            standard: "legacy1.5",
            detailpage: "",
            nftlicense: "",
            kyc: true,
            owner:
              "9347d41500853bd74af1d48b9f6dfd1fb4eb753706b3103e6fec9e642d849ffe",
            royalty:
              "9347d41500853bd74af1d48b9f6dfd1fb4eb753706b3103e6fec9e642d849ffe:0.025",
          },
          canisterId: "zhibq-piaaa-aaaah-qcvka-cai",
          index: 571,
          tokenId: nft?.tokenId,
          name: nft?.title,
          assetPreview: nft?.thumbnail,
          assetFullsize: {
            url: nft?.image,
            format: "image",
          },
          blockchain: "Ethereum",
        })) ?? [],
      )
  }, [data, applicationsMeta, ethNFTS])
  return { nfts, isLoading: isLoading || isValidating }
}
