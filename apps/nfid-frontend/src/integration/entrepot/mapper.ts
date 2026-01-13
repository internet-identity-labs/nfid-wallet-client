import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"

import { decodeTokenIdentifier } from "src/integration/entrepot/ext"

import { EntrepotToken, UserNFTDetails } from "./types"

import { collection, token } from "."

export async function mapToNFTData(
  response: EntrepotToken[],
  principal: Principal,
  account: Account,
): Promise<UserNFTDetails[]> {
  return (
    await Promise.all(
      response.map(async (entrepotNFT) => {
        let _token

        try {
          const _collection = await collection(entrepotNFT.canisterId)
          const { index } = decodeTokenIdentifier(entrepotNFT.tokenId)
          _token = await token(_collection, response, index)
        } catch (e) {
          console.log("mapToNFTData", { e })
        }

        return { ..._token, principal, account } as UserNFTDetails
      }),
    )
  ).filter((nft) => nft?.tokenId && nft?.collection?.id)
}
