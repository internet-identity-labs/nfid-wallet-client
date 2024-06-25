import { Cache } from "node-ts-cache"
import { EthTransferRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/eth-populate-transaction.service"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonMumbaiAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "frontend/ui/connnector/cache"
import { Blockchain, NativeToken } from "frontend/ui/connnector/types"

import { EVMTransferConnector } from "../../evm-transfer-connector"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  TransferModalType,
} from "../../types"

export class MaticMumbaiTransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getEstimatedTransaction({
    to,
    amount,
  }: ITransferFTRequest): Promise<EstimatedTransaction> {
    const cacheKey = this.config.tokenStandard + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount as any)
    const estimatedTransaction =
      await polygonMumbaiAsset.getEstimatedTransaction(request)
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return estimatedTransaction
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({ to, amount }: ITransferFTRequest): Promise<bigint> {
    const cacheKey = this.config.tokenStandard + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount as any)
    const estimatedTransaction =
      await polygonMumbaiAsset.getEstimatedTransaction(request)
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return BigInt(estimatedTransaction.fee)
  }
}

export const polygonMumbaiTransferConnector = new MaticMumbaiTransferConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  blockchain: Blockchain.POLYGON_MUMBAI,
  feeCurrency: NativeToken.MATIC,
  addressPlaceholder: "Recipient Polygon address",
  type: TransferModalType.FT,
  assetService: polygonMumbaiAsset,
  isNativeToken: true,
  duration: "10 min",
})
