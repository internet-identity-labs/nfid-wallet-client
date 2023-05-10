import {NonFungibleAssetConnector} from "src/ui/connnector/non-fungible-asset-screen/non-fungible-asset";
import {Blockchain, NftConnectorConfig} from "src/ui/connnector/types";
import {ethereumAsset} from "@nfid/integration";
import {IconPngEthereum} from "@nfid-frontend/ui";

export class EthereumNftConnector extends NonFungibleAssetConnector<NftConnectorConfig> {
}

export const ethereumNftConnector = new EthereumNftConnector({
  blockchain: Blockchain.ETHEREUM,
  defaultLogo: IconPngEthereum,
  assetService: ethereumAsset
})
