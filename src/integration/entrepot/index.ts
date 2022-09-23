import { Principal } from "@dfinity/principal"
import { decodeTokenIdentifier, encodeTokenIdentifier } from "ictool"

import { Account } from "frontend/integration/identity-manager"

import {
  assetFullsize,
  assetPreview,
  fetchCollection,
  fetchCollections,
  fetchCollectionTokens,
  fetchNFTsOfPrincipals,
  getTokenLink,
} from "./lib"
import type {
  EntrepotCollection,
  EntrepotToken,
  NFTDetails,
  UserNFTDetails,
} from "./types"

/**
 * Retrieve all known NFT collections.
 */
export async function collections(): Promise<EntrepotCollection[]> {
  return Object.values(await fetchCollections())
}

/**
 * Retrieve details for a specific collection.
 * @param id Canister ID of the collection.
 */
export async function collection(id: string): Promise<EntrepotCollection> {
  return fetchCollection(id)
}

/**
 * Retrieve details for a specific token.
 */
export async function token(
  collection: EntrepotCollection,
  tokens: EntrepotToken[],
  index: number,
): Promise<NFTDetails> {
  const tokenId = encodeTokenIdentifier(collection.id, index)
  const token = tokens.find((token) => token.tokenId === tokenId)
  if (!token) {
    throw new Error(
      `Could not find token #${index} of ${collection.name} (${collection.id})`,
    )
  }
  return {
    collection,
    canisterId: collection.id,
    index,
    tokenId,
    name: `${collection.name} #${index}`,
    assetPreview: assetPreview(collection, token),
    assetFullsize: await assetFullsize(collection, token),
  }
}

/**
 * Retrieve tokens for a given collection.
 */
export async function tokens(
  collection: EntrepotCollection,
): Promise<NFTDetails[]> {
  return Promise.all(
    await fetchCollectionTokens(collection).then((tokens) =>
      tokens.slice(0, 4).map(async ({ tokenId }) => {
        const { index } = decodeTokenIdentifier(tokenId)
        return await token(collection, tokens, index)
      }),
    ),
  )
}

/**
 * Retrieve link to NFT.
 */
export function link(canister: string, index: number): string {
  return getTokenLink(canister, index)
}

/**
 * Retrieve all NFTs for the given principals.
 */
export async function principalTokens(
  inputData: { principal: Principal; account: Account }[],
): Promise<UserNFTDetails[]> {
  return (await fetchNFTsOfPrincipals(inputData)).flat()
}
