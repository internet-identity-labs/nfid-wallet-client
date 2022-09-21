import { Principal } from "@dfinity/principal"
import { Account } from "frontend/integration/identity-manager"
import { decodeTokenIdentifier } from "ictool"
import { collection, token } from "."
import { EntrepotToken, UserNFTDetails } from "./types"

export async function mapToNFTData(
  response: EntrepotToken[],
  principal: Principal,
  account: Account,
): Promise<UserNFTDetails[]> {
  return Promise.all(response.map(async (entrepotNFT) => {
    const _collection = await collection(entrepotNFT.canisterId);
    const { index } = decodeTokenIdentifier(entrepotNFT.tokenId);
    const _token = await token(_collection, response, index)
    return { ..._token, principal, account }
  }))
}
