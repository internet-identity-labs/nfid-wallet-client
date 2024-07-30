import { NonFungibleItem } from "packages/integration/src/lib/asset/types"
import { NftConnectorConfig } from "src/ui/connnector/types"

import { authState } from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"

export function toUserNFT(
  nft: NonFungibleItem,
  owner: string,
  conf: NftConnectorConfig,
): UserNonFungibleToken {
  return {
    account: {
      domain: "nfid.one",
      label: "account 1",
      accountId: "-1",
    },
    assetFullsize: {
      url: nft.image.length === 0 ? conf.defaultLogo : nft.image,
      format: nft?.imageType ?? "img",
    },
    assetPreview: {
      url: nft?.thumbnail!,
      format: nft?.imageType ?? "img",
    },
    blockchainLogo: conf.defaultLogo,
    // @ts-ignore
    blockchain: conf.blockchain,
    collection: {
      description: nft.description,
      id: nft.collection || "N/A",
      name: nft.contractName || "N/A",
      standard: nft.tokenType,
    },
    clipboardText: nft.image,
    contractId: nft.contract || "N/A",
    index: nft.id,
    name: nft.title,
    tokenId: nft.tokenId || "N/A",
    owner,
    walletName: "NFID",
    principal: authState.get().delegationIdentity?.getPrincipal()!,
  }
}
