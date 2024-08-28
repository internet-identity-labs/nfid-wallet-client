import { Principal } from "@dfinity/principal"
import { NonFungibleItem } from "packages/integration/src/lib/asset/types"

import {
  IGroupOption,
  IGroupedOptions,
  IconSvgDfinity,
} from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { fetchApplications } from "frontend/integration/identity-manager"
import { NFT } from "frontend/integration/nft/nft"

import { Blockchain } from "../../types"

export const userNFTDetailsToNFT = (
  nfts: UserNFTDetails[],
): UserNonFungibleToken[] => {
  return nfts.map((nft) => ({
    ...nft,
    contractId: nft.canisterId,
    owner: nft.principal.toString(),
    blockchainLogo: IconSvgDfinity,
    blockchain: nft.blockchain,
  }))
}

export const mapUserNFTDetailsToGroupedOptions = (
  userNFTDetailsArray: NFT[],
): IGroupedOptions[] => {
  const options = userNFTDetailsArray.map(
    (nft) =>
      ({
        title: nft.getTokenName(),
        subTitle: nft.getCollectionName(),
        value: nft.getTokenId(),
        icon: nft.getAssetPreview().url,
      } as IGroupOption),
  )

  return [
    {
      label: "label",
      options,
    },
  ]
}

// export const getNFTOptions = async (nfts: NFT[]): Promise<IGroupedOptions[]> =>{
//   const applications = await fetchApplications()
//   return mapUserNFTDetailsToGroupedOptions(nfts, applications)
// }

export function toUserNFT(
  nft: NonFungibleItem,
  principal: Principal,
  defaultLogo: string,
  address: string,
  blockchain?: Blockchain,
): UserNonFungibleToken {
  return {
    account: {
      domain: "nfid.one",
      label: "account 1",
      accountId: "-1",
    },
    assetFullsize: {
      url: nft?.image.length === 0 ? defaultLogo : nft?.image,
      format: "img",
    },
    assetPreview: {
      url: nft?.thumbnail!,
      format: nft?.imageType ?? "img",
    },
    blockchainLogo: defaultLogo,
    // @ts-ignore
    blockchain: blockchain ?? nft?.blockchain,
    collection: {
      description: nft?.description,
      id: nft?.collection || "N/A",
      name: nft?.contractName || "N/A",
      standard: nft?.tokenType,
    },
    clipboardText: nft?.image,
    contractId: nft?.contract || "N/A",
    index: nft?.id,
    name: nft?.title,
    principal: principal,
    tokenId: nft?.tokenId || "N/A",
    owner: address,
    walletName: "NFID",
  }
}
