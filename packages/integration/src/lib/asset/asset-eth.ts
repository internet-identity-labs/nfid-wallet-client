import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { AssetTransfersCategory, Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"

export const ethereumAsset = new EthereumAsset({
  currencyId: "ETHEREUM:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.ETHEREUM as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://eth-mainnet.g.alchemy.com/v2/${ETH_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.ETH_MAINNET,
  raribleEnv: "prod",
  raribleApiKey: PROD_RARIBLE_X_API_KEY,
  etherscanUrl: "https://etherscan.io/tx/",
  symbol: "ETH",
  token: "Ethereum",
  blockchainName: "Ethereum",
  alchemyApiKey: ETH_ALCHEMY_API_KEY,
  activitiesTypes: Object.values(AssetTransfersCategory)
})

export const ethereumGoerliAsset = new EthereumAsset({
  currencyId: "ETHEREUM:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.ETHEREUM as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  providerUrl: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_API_KEY}`,
  alchemyNetwork: Network.ETH_GOERLI,
  raribleEnv: "testnet",
  raribleApiKey: RARIBLE_X_API_KEY,
  etherscanUrl: "https://goerli.etherscan.io/tx/",
  symbol: "ETH",
  token: "Ethereum Goerli",
  blockchainName: "Ethereum Goerli",
  alchemyApiKey: GOERLI_ALCHEMY_API_KEY,
  activitiesTypes: Object.values(AssetTransfersCategory)
})
