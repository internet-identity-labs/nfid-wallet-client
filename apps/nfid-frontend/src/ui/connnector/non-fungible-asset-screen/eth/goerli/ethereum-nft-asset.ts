import { NonFungibleAssetConnector } from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset"
import { Blockchain, NftConnectorConfig } from "src/ui/connnector/types"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"

export class EthereumGoerliNftConnector extends NonFungibleAssetConnector<NftConnectorConfig> {}

// export const ethereumGoerliNftConnector = new EthereumGoerliNftConnector({
//   blockchain: Blockchain.ETHEREUM_GOERLI,
//   defaultLogo: IconPngEthereum,
//   assetService: ethereumGoerliAsset,
// })
