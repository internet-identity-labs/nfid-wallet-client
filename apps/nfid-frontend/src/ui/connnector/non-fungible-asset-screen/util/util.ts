import { Principal } from "@dfinity/principal"
import { NonFungibleItem } from "packages/integration/src/lib/asset/types"
import { UserNonFungibleToken } from "src/features/non-fungable-token/types"
import { NftConnectorConfig } from "src/ui/connnector/types"

import { MaticSvg } from "@nfid-frontend/ui"

export function toUserNFT(
  nft: NonFungibleItem,
  principal: Principal,
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
      url: nft?.thumbnail || MaticSvg,
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
    principal: principal,
    tokenId: nft.tokenId || "N/A",
    owner: principal.toString(),
    walletName: "NFID",
  }
}
