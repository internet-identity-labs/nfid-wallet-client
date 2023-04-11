import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"

export const polygonAsset = new EthereumAsset({
  currencyId: "POLYGON:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.POLYGON as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  provider: {
    mainnet: "https://polygon-mainnet.infura.io",
    testnet: "https://rpc-mumbai.maticvigil.com",
  },
  alchemy: { mainnet: Network.MATIC_MAINNET, testnet: Network.MATIC_MUMBAI },
})
