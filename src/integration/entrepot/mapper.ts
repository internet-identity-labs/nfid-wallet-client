import { Principal } from "@dfinity/principal"

import {
  EntrepotNFTData,
  NFTData,
  NFTDetails,
} from "frontend/integration/entrepot/entrepot_interface"
import { Account } from "frontend/integration/identity-manager"

export async function mapToNFTData(
  response: Response,
  principal: Principal,
  account: Account,
): Promise<NFTData[]> {
  return await response
    .json()
    .then((data) => data as EntrepotNFTData[])
    .then((responseDataArray: EntrepotNFTData[]) => {
      return responseDataArray.map((entrepotNFT) => {
        return {
          account: account,
          canisterId: entrepotNFT.canisterId,
          imageUrl: entrepotNFT.imageUrl,
          owner: entrepotNFT.owner,
          principal: principal,
          tokenId: entrepotNFT.tokenId,
        } as NFTData
      })
    })
}

export async function toNftDetails(response: Response): Promise<NFTDetails[]> {
  return await response.json().then((data) => data as NFTDetails[])
}
