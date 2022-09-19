import { Principal } from "@dfinity/principal"
import { Account } from "frontend/integration/identity-manager"
import {
  CollectionDetailEntrepot,
  EntrepotNFTData,
  NFTData,
  NFTDetails,
} from "frontend/integration/entrepot/entrepot_interface"


export async function mapToNFTData(response: Response, principal: Principal, account: Account): Promise<NFTData[]> {
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

export async function toCollectionDetailEntrepot(response: Response): Promise<CollectionDetailEntrepot[]> {
  return await response
    .json()
    .then((data) => data as CollectionDetailEntrepot[])
}

export function mapEntrepotInfoToNFTData(details: CollectionDetailEntrepot): NFTDetails {
  return {
    avatar: details.avatar,
    banner: details.banner,
    blurb: details.blurb,
    brief: details.brief,
    collection: details.collection,
    commission: details.commission,
    description: details.description,
    detailpage: details.detailpage,
    dev: details.dev,
    discord: details.discord,
    distrikt: details.distrikt,
    dscvr: details.dscvr,
    earn: details.earn,
    external: details.external,
    filter: details.filter,
    id: details.id,
    keywords: details.keywords,
    kyc: details.kyc,
    legacy: details.legacy,
    market: details.market,
    mature: details.mature,
    medium: details.medium,
    name: details.name,
    nftlicense: details.nftlicense,
    nftv: details.nftv,
    priority: details.priority,
    route: details.route,
    sale: details.sale,
    saletype: details.saletype,
    standard: details.standard,
    telegram: details.telegram,
    twitter: details.twitter,
    unit: details.unit,
    web: details.web,
  } as NFTDetails
}


