import { Alchemy, BigNumber, Network } from "alchemy-sdk"
import { ethers } from "ethers"

const ethMainnet = new Alchemy({
  apiKey: ETH_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
})

const maticMainnet = new Alchemy({
  apiKey: MATIC_ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
})

const maticMumbai = new Alchemy({
  apiKey: MUMBAI_ALCHEMY_API_KEY,
  network: Network.MATIC_MUMBAI,
})

const alchemies: Record<number, Alchemy> = {
  1: ethMainnet,
  137: maticMainnet,
  80001: maticMumbai,
}

interface AlchemyService {
  estimateGas(
    chainId: number,
    tx: ethers.providers.TransactionRequest,
  ): Promise<BigNumber>
}

export const alchemyService: AlchemyService = {
  estimateGas: function (
    chainId: number,
    tx: ethers.providers.TransactionRequest,
  ): Promise<BigNumber> {
    return alchemies[chainId].core.estimateGas(tx)
  },
}
