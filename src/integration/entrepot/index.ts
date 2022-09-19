import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import {
  NFTData,
  NFTDetails,
} from "frontend/integration/entrepot/entrepot_interface"
import {
  mapToNFTData,
  toNftDetails,
} from "frontend/integration/entrepot/mapper"
import { Account } from "frontend/integration/identity-manager"
import { restCall } from "frontend/integration/rosetta/util"

const entrepot = "https://us-central1-entrepot-api.cloudfunctions.net/api"

export async function getNFTsOfPrincipals(
  inputData: { principal: Principal; account: Account }[],
): Promise<NFTData[]> {
  let nftDataObjects: NFTData[] = []
  for (const data of inputData) {
    let address: string = principalToAddress(data.principal as any)
    await restCall("GET", `${entrepot}/maddies/getAllNfts/${address}`)
      .then((r) => mapToNFTData(r, data.principal, data.account))
      .then((nft) => {
        nftDataObjects = nftDataObjects.concat(nft)
      })
  }
  return nftDataObjects
}

export async function getNFTDetails(canisterId: string): Promise<NFTDetails> {
  let nftDetails = await restCall("GET", `${entrepot}/collections`)
    .then(toNftDetails)
    .then((l) => l.find((e) => e.id === canisterId))
  console.log(nftDetails)
  if (typeof nftDetails === "undefined") {
    throw Error(`Collection is undefined ${canisterId}`)
  }
  return nftDetails
}
