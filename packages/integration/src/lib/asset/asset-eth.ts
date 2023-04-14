import { Blockchain } from "@rarible/api-client"
import { EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { Network } from "alchemy-sdk"

import { EthereumAsset } from "./asset-ethereum"

export const ethereumAsset = new EthereumAsset({
  currencyId: "ETHEREUM:0x0000000000000000000000000000000000000000",
  blockchain: Blockchain.ETHEREUM as EVMBlockchain,
  unionBlockchain: Blockchain.ETHEREUM as EVMBlockchain,
  provider: {
    mainnet: "https://ethereum.publicnode.com",
    testnet:
      "https://eth-goerli.g.alchemy.com/v2/KII7f84ZxFDWMdnm_CNVW5hI8NfbnFhZ",
  },
  alchemy: { mainnet: Network.ETH_MAINNET, testnet: Network.ETH_GOERLI },
  etherscanUrl: {
    mainnet: "https://etherscan.io/tx/",
    testnet: "https://goerli.etherscan.io/tx/",
  },
})
