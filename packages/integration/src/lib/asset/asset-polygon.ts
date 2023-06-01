import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"

export const polygonAsset = new EthereumAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://polygon-mainnet.g.alchemy.com/v2/${MATIC_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.MATIC_MAINNET,
  raribleEnv: "prod",
  etherscanUrl: "https://polygonscan.com/tx/",
  symbol: "MATIC",
  token: "Matic",
  blockchainName: "Polygon",
  alchemyApiKey: MATIC_ALCHEMY_API_KEY,
})

export const polygonMumbaiAsset = new EthereumAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.MATIC_MUMBAI,
  raribleEnv: "testnet",
  etherscanUrl: "https://mumbai.polygonscan.com/tx/",
  symbol: "MATIC",
  token: "Matic",
  blockchainName: "Polygon",
  alchemyApiKey: MUMBAI_ALCHEMY_API_KEY,
})
