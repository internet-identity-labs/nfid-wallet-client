import {NonFungibleAssetConnector} from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset";
import {Blockchain, NftConnectorConfig} from "src/ui/connnector/types";
import {polygonAsset} from "@nfid/integration";
import {MaticSvg} from "@nfid-frontend/ui";

export class PolygonNftConnector extends NonFungibleAssetConnector<NftConnectorConfig> {}

export const polygonNftConnector = new PolygonNftConnector({
  blockchain: Blockchain.POLYGON,
  defaultLogo: MaticSvg,
  assetService: polygonAsset
})
