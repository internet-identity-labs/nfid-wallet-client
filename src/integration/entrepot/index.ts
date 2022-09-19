import { Principal } from "@dfinity/principal"
import { restCall } from "frontend/integration/rosetta/util"
import { principalToAddress } from "ictool"
import { Account } from "frontend/integration/identity-manager"
import { NFTData, NFTDetails } from "frontend/integration/entrepot/entrepot_interface"
import {
  mapEntrepotInfoToNFTData,
  mapToNFTData,
  toCollectionDetailEntrepot,
  toCollectionInfoEntrepot,
} from "frontend/integration/entrepot/mapper"


const entrepot = "https://us-central1-entrepot-api.cloudfunctions.net/api"

export async function getNFTsOfPrincipals(inputData: { principal: Principal, account: Account }[]): Promise<NFTData[]> {
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
  let collectionData = await restCall("GET", `${entrepot}/collections`)
    .then(toCollectionDetailEntrepot)
    .then((l) => l.find((e) => e.id === canisterId))
  if (typeof collectionData === "undefined") {
    throw Error(`Collection is undefined ${canisterId}`)
  }
  console.log(collectionData)
  let collectionInfo = await restCall("GET", `${entrepot}/maddies/collectionInfo/${canisterId}`)
    .then(toCollectionInfoEntrepot)
  return mapEntrepotInfoToNFTData(collectionInfo, collectionData)
}
