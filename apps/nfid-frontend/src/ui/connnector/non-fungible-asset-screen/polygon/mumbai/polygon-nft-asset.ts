import { NonFungibleAssetConnector } from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset"
import { Blockchain, NftConnectorConfig } from "src/ui/connnector/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonMumbaiAsset } from "@nfid/integration"

export class PolygonMumbaiNftConnector extends NonFungibleAssetConnector<NftConnectorConfig> {}

export const polygonMumbaiNftConnector = new PolygonMumbaiNftConnector({
  blockchain: Blockchain.POLYGON_MUMBAI,
  defaultLogo: MaticSvg,
  assetService: polygonMumbaiAsset,
})
