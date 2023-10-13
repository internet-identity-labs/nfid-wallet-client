import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { AssetTransfersCategory, Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"

export const polygonAsset = new EthereumAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://polygon-mainnet.g.alchemy.com/v2/${MATIC_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.MATIC_MAINNET,
  raribleEnv: "prod",
  raribleApiKey: PROD_RARIBLE_X_API_KEY,
  etherscanUrl: "https://polygonscan.com/tx/",
  symbol: "MATIC",
  token: "Matic",
  blockchainName: "Polygon",
  alchemyApiKey: MATIC_ALCHEMY_API_KEY,
  activitiesTypes: Object.values(AssetTransfersCategory).filter(
    (x) => x !== AssetTransfersCategory.INTERNAL,
  ),
})

export const polygonMumbaiAsset = new EthereumAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.MATIC_MUMBAI,
  raribleEnv: "testnet",
  raribleApiKey: RARIBLE_X_API_KEY,
  etherscanUrl: "https://mumbai.polygonscan.com/tx/",
  symbol: "MATIC",
  token: "Matic Mumbai",
  blockchainName: "Polygon Mumbai",
  alchemyApiKey: MUMBAI_ALCHEMY_API_KEY,
  activitiesTypes: Object.values(AssetTransfersCategory).filter(
    (x) => x !== AssetTransfersCategory.INTERNAL,
  ),
})
