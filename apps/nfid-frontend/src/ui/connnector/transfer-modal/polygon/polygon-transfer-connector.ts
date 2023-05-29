import { EthTransferRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/eth-populate-transaction.service"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { MaticSvg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferFTConnector,
  ITransferFTModalConfig,
  ITransferFTRequest,
  TokenFee,
} from "../types"
import { EVMTransferConnector } from "./evm-transfer-connector"

export class MaticTransferConnector
  extends EVMTransferConnector<ITransferFTModalConfig>
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

  async getFee({ to, amount }: ITransferFTRequest): Promise<TokenFee> {
    const cacheKey = this.config.tokenStandard + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount)
    const estimatedTransaction = await polygonAsset.getEstimatedTransaction(
      request,
    )
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return {
      fee: `${estimatedTransaction.fee} ${this.config.feeCurrency}`,
      feeUsd: estimatedTransaction.feeUsd,
    }
  }
}

export const polygonTransferConnector = new MaticTransferConnector({
  icon: MaticSvg,
  tokenStandard: TokenStandards.MATIC,
  blockchain: Blockchain.POLYGON,
  feeCurrency: NativeToken.MATIC,
  title: "Polygon",
  isNativeToken: true,
  addressPlaceholder: "Recipient Polygon address",
  type: "ft",
})
