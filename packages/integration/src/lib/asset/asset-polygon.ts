import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"
import { NonFungibleAsset } from "./non-fungible-asset";


export class PolygonAsset extends EthereumAsset {

  override getBlockchain(): string {
    return "Polygon"
  }
}

export const polygonAsset = new PolygonAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  provider: {
    mainnet: "https://polygon-mainnet.infura.io",
    testnet: "https://rpc-mumbai.maticvigil.com",
  },
  alchemy: { mainnet: Network.MATIC_MAINNET, testnet: Network.MATIC_MUMBAI },
  etherscanUrl: {
    mainnet: "https://polygonscan.com/tx/",
    testnet: "https://mumbai.polygonscan.com/tx/",
  },
})
