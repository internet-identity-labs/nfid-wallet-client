import { Cache } from "node-ts-cache"
import { EthTransferRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/eth-populate-transaction.service"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import { EVMTransferConnector } from "../evm-transfer-connector"
import {
  ITransferFTConnector,
  ITransferConfig,
  ITransferFTRequest,
  TransferModalType,
} from "../types"

export class MaticTransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getEstimatedTransaction({
    to,
    amount,
  }: ITransferFTRequest): Promise<EstimatedTransaction> {
    const cacheKey = this.config.tokenStandard + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount)
    const estimatedTransaction = await polygonAsset.getEstimatedTransaction(
      request,
    )
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return estimatedTransaction
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({ to, amount }: ITransferFTRequest): Promise<number> {
    const cacheKey = this.config.tokenStandard + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount)
    const estimatedTransaction = await polygonAsset.getEstimatedTransaction(
      request,
    )
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return +estimatedTransaction.fee
  }
}

export const polygonTransferConnector = new MaticTransferConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  blockchain: Blockchain.POLYGON,
  feeCurrency: NativeToken.MATIC,
  addressPlaceholder: "Recipient Polygon address",
  type: TransferModalType.FT,
  assetService: polygonAsset,
  isNativeToken: true,
  duration: "10 min",
})
