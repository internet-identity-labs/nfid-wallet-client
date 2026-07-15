import { Contract, InfuraProvider } from "ethers"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService, SendEthFee } from "../evm.service"

const GAS_PRICE_ORACLE_ADDRESS = "0x420000000000000000000000000000000000000F"
const GAS_PRICE_ORACLE_ABI = [
  "function getL1FeeUpperBound(uint256 unsignedTxSize) view returns (uint256)",
]
// Approximate size in bytes of an unsigned ETH transfer tx
const ETH_TRANSFER_TX_SIZE = BigInt(110)

export class BaseService extends EVMService {
  private gasOracle: Contract

  constructor() {
    super()
    this.provider = new InfuraProvider(ChainId.BASE, INFURA_API_KEY)
    this.gasOracle = new Contract(
      GAS_PRICE_ORACLE_ADDRESS,
      GAS_PRICE_ORACLE_ABI,
      this.provider,
    )
  }

  public async getSendEthFee(
    to: string,
    from: string,
    value: string,
  ): Promise<SendEthFee> {
    const [l2Fee, l1Fee] = await Promise.all([
      super.getSendEthFee(to, from, value),
      this.gasOracle.getL1FeeUpperBound(ETH_TRANSFER_TX_SIZE),
    ])
    return {
      ...l2Fee,
      ethereumNetworkFee: l2Fee.ethereumNetworkFee + BigInt(l1Fee),
    }
  }
}

export const baseService = new BaseService()
