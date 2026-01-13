import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"
import { Blockchain } from "@nfid/integration/token/types"

import {
  decodeTokenIdentifier,
  encodeTokenIdentifier,
} from "src/integration/entrepot/ext"

import { mapToNFTData } from "./mapper"
import {
  CollectionCache,
  DisplayFormat,
  EntrepotCollection,
  EntrepotDisplayFormat,
  EntrepotToken,
  TokenCache,
  UserNFTDetails,
} from "./types"

const API = "https://us-central1-entrepot-api.cloudfunctions.net/api"
const TREASURECANISTER = "yigae-jqaaa-aaaah-qczbq-cai"

let collectionsCache: Promise<CollectionCache>
const tokenCache: TokenCache = {}

/**
 * Fetch and cache all known NFT collections from entrepot API.
 */
export async function fetchCollections(): Promise<CollectionCache> {
  if (!collectionsCache) {
    collectionsCache = fetch(`${API}/collections`)
      .then((r) => r.json())
      .then((r: EntrepotCollection[]) =>
        r.reduce(
          (agg, x) => ({
            ...agg,
            [x.id]: x,
          }),
          {},
        ),
      )
  }
  return collectionsCache
}

/**
 * Fetch a specific collection from the cache.
 */
export async function fetchCollection(
  canisterId: string,
): Promise<EntrepotCollection> {
  const collection = (await fetchCollections())[canisterId]
  if (!collection) throw new Error(`Unknown collection ${canisterId}`)
  return collection
}

/**
 * Fetch and cache all tokens from a specific token canister.
 */
export async function fetchCollectionTokens(
  collectionId: string,
): Promise<EntrepotToken[]> {
  if (!tokenCache[collectionId]) {
    const tokens: EntrepotToken[] = await fetch(
      `${API}/maddies/getNftCollection/${collectionId}`,
    ).then((r) => r.json())
    tokenCache[collectionId] = tokens
  }
  return tokenCache[collectionId]
}

/**
 * Determines asset path using compatability code from Entrepot source.
 */
export function entrepotAsset(
  collectionId: string,
  token: string,
  fullSize: boolean,
): string {
  const { index } = decodeTokenIdentifier(token)
  if (collectionId === "jeghr-iaaaa-aaaah-qco7q-cai")
    return `https://fl5nr-xiaaa-aaaai-qbjmq-cai.raw.icp0.io/nft/${index}`
  if (collectionId === "bxdf4-baaaa-aaaah-qaruq-cai")
    return `https://qcg3w-tyaaa-aaaah-qakea-cai.raw.icp0.io/Token/${index}`
  if (collectionId === "y3b7h-siaaa-aaaah-qcnwa-cai")
    return `https://4nvhy-3qaaa-aaaah-qcnoq-cai.raw.icp0.io/Token/${index}`
  if (collectionId === "3db6u-aiaaa-aaaah-qbjbq-cai")
    return `https://d3ttm-qaaaa-aaaai-qam4a-cai.raw.icp0.io?tokenId=${index}`
  if (collectionId === "q6hjz-kyaaa-aaaah-qcama-cai") return icpbunnyimg(index)
  if (collectionId === "pk6rk-6aaaa-aaaae-qaazq-cai") {
    if (fullSize) {
      return `https://${collectionId}.raw.icp0.io/?tokenid=${token}`
    } else {
      return `https://images.entrepot.app/t/7budn-wqaaa-aaaah-qcsba-cai/${token}`
    }
  }
  if (collectionId === "dhiaa-ryaaa-aaaae-qabva-cai") {
    if (fullSize) {
      return `https://${collectionId}.raw.icp0.io/?tokenid=${token}`
    } else {
      return `https://images.entrepot.app/tnc/qtejr-pqaaa-aaaah-qcyvq-cai/${token}`
    }
  }
  if (collectionId === "skjpp-haaaa-aaaae-qac7q-cai") {
    if (fullSize) {
      return `https://${collectionId}.raw.icp0.io/?tokenid=${token}`
    } else {
      return `https://images.entrepot.app/tnc/wtwf2-biaaa-aaaam-qauoq-cai/${token}`
    }
  }
  if (collectionId === TREASURECANISTER) {
    if (!fullSize) {
      return "/earn/loading.png"
    }
  }
  if (fullSize) {
    return `https://${collectionId}.raw.icp0.io/?tokenid=${token}`
  } else {
    //add collections with wearables or other dynamic traits here
    //these images will not be cached
    if (collectionId === "rxrsz-5aaaa-aaaam-qaysa-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    if (collectionId === "sbcwr-3qaaa-aaaam-qamoa-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    if (collectionId === "yrdz3-2yaaa-aaaah-qcvpa-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    if (collectionId === "rw7qm-eiaaa-aaaak-aaiqq-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    if (collectionId === "5movr-diaaa-aaaak-aaftq-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    if (collectionId === "dhyds-jaaaa-aaaao-aaiia-cai")
      return `https://images.entrepot.app/tnc/${collectionId}/${token}`
    //end of section

    if (collectionId === "6wih6-siaaa-aaaah-qczva-cai")
      return `https://${collectionId}.raw.icp0.io/?cc${Date.now()}&type=thumbnail&tokenid=${token}`
    if (collectionId === "kss7i-hqaaa-aaaah-qbvmq-cai")
      return `https://${collectionId}.raw.icp0.io/?type=thumbnail&tokenid=${token}`
    return `https://images.entrepot.app/t/${collectionId}/${token}`
  }
}

export function getEntrepotDisplayFormat(
  collection: EntrepotCollection,
  tokenId: string,
): EntrepotDisplayFormat {
  const { index } = decodeTokenIdentifier(tokenId)
  // Motoko Mechs specific
  if (collection.id === "ugdkf-taaaa-aaaak-acoia-cai") {
    return "motoko_mechs"
  }

  if (index === 99 && collection.id === "kss7i-hqaaa-aaaah-qbvmq-cai")
    return "interactive_nfts_or_videos"

  if (collection.detailpage) return collection.detailpage

  return "default"
}

export function getDisplayFormat(format: EntrepotDisplayFormat): DisplayFormat {
  switch (format) {
    case "interactive_nfts_or_videos":
      return "iframe"
    case "videos_that_dont_fit_in_frame":
      return "video"
    case "":
    case "default":
    case "asset_canisters":
    case "generative_assets_on_nft_canister":
    case "motoko_mechs":
    default:
      return "img"
  }
}

/**
 * Retrieve preview image asset for NFT.
 */
export function assetPreview(
  collection: EntrepotCollection,
  token: EntrepotToken,
): string {
  return entrepotAsset(collection.id, token.tokenId, false)
}

/**
 * Retrieve fullsize asset for NFT. Assets have variable mime types and  must be rendered correctly based on returned type.
 */
export async function assetFullsize(
  collection: EntrepotCollection,
  tokenId: string,
  fullSize: boolean = false,
): Promise<{
  url: string
  format: DisplayFormat
}> {
  const url = entrepotAsset(collection.id, tokenId, true)
  const _format = getEntrepotDisplayFormat(collection, tokenId)
  const format = getDisplayFormat(_format)
  if (_format === "default") {
    return { url: entrepotAsset(collection.id, tokenId, fullSize), format }
  }
  if (_format === "asset_canisters") {
    return { url: await getImageDetailsUrl(url), format }
  }
  if (_format === "videos_that_dont_fit_in_frame") {
    return { url: await getVideoDetailsUrl(url), format }
  }
  return { url, format }
}

/**
 * Determines canister ID for given ICP Bunnies token index.
 */
function icpbunnyimg(index: number) {
  const icbstorage = [
    "efqhu-yqaaa-aaaaf-qaeda-cai",
    "ecrba-viaaa-aaaaf-qaedq-cai",
    "fp7fo-2aaaa-aaaaf-qaeea-cai",
    "fi6d2-xyaaa-aaaaf-qaeeq-cai",
    "fb5ig-bqaaa-aaaaf-qaefa-cai",
    "fg4os-miaaa-aaaaf-qaefq-cai",
    "ft377-naaaa-aaaaf-qaega-cai",
    "fu2zl-ayaaa-aaaaf-qaegq-cai",
    "f5zsx-wqaaa-aaaaf-qaeha-cai",
    "f2yud-3iaaa-aaaaf-qaehq-cai",
  ]
  return `https://${icbstorage[index % 10]}.raw.ic0.io/Token/${index}`
}

/**
 * Retrieve primary link to NFT. This is some hard-coded stuff taken from Entrepot source code to improve compatability.
 */
export function getTokenLink(canister: string, index: number): string {
  const id = encodeTokenIdentifier(canister, index)
  if (canister === "jeghr-iaaaa-aaaah-qco7q-cai")
    return `https://fl5nr-xiaaa-aaaai-qbjmq-cai.raw.icp0.io/nft/${index}`
  if (canister === "bxdf4-baaaa-aaaah-qaruq-cai")
    return `https://qcg3w-tyaaa-aaaah-qakea-cai.raw.icp0.io/Token/${index}`
  if (canister === "y3b7h-siaaa-aaaah-qcnwa-cai")
    return `https://4nvhy-3qaaa-aaaah-qcnoq-cai.raw.icp0.io/Token/${index}`
  if (canister === "3db6u-aiaaa-aaaah-qbjbq-cai")
    return `https://d3ttm-qaaaa-aaaai-qam4a-cai.raw.icp0.io?tokenId=${index}`
  if (canister === "q6hjz-kyaaa-aaaah-qcama-cai") return icpbunnyimg(index)
  return `https://${canister}.raw.icp0.io/?tokenid=${id}`
}

/**
 * Extract usable image from
 */
export async function getImageDetailsUrl(url: string): Promise<string> {
  const regExp = /image href="([^"]+)"/
  const response = await fetch(url)
  const blob = await response.blob()
  const text = await blob.text()
  const simplifiedText = text.replace("\n", " ").replace(/\s{2,}/, " ")
  const result = simplifiedText.match(regExp)?.[1]
  if (!result) throw new Error("Could not extract image")
  return result
}

export async function getVideoDetailsUrl(url: string) {
  const regExp = /source src="([^"]+)"/
  const regExp2 = 'URL=([^"]+)"'
  const response = await fetch(url)
  const blob = await response.blob()
  const text = await blob.text()
  const simplifiedText = text.replace("\n", " ").replace(/\s{2,}/, " ")
  if (simplifiedText.includes("URL=")) {
    const result = simplifiedText.match(regExp2)?.[1]
    if (!result) throw new Error("Could not extract video")
    return result
  } else if (simplifiedText.includes("source")) {
    const result = simplifiedText.match(regExp)?.[1]
    if (!result) throw new Error("Could not extract video")
    return result
  } else {
    const result = url
    if (!result) throw new Error("Could not extract video")
    return result
  }
}

export async function fetchNFTsOfPrincipals(
  inputData: { principal: Principal; account: Account }[],
): Promise<UserNFTDetails[]> {
  const response = await Promise.all(
    inputData.map(async ({ principal, account }) => {
      const address: string = AccountIdentifier.fromPrincipal({
        principal,
      }).toHex()
      return await fetch(`${API}/maddies/getAllNfts/${address}`)
        .then((r) => r.json())
        .then((r: EntrepotToken[]) => mapToNFTData(r, principal, account))
    }),
  )
  return response.flat().map((nft) => ({ ...nft, blockchain: Blockchain.IC }))
}
