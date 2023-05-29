import { EthTransferRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/eth-populate-transaction.service"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import { EVMTransferConnector } from "../evm-transfer-connector"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  TokenFee,
  TransferModalType,
} from "../types"

export class EthTransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getFee({
    to,
    amount,
    currency,
  }: ITransferFTRequest): Promise<TokenFee> {
    const cacheKey = currency + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount)
    const estimatedTransaction = await ethereumAsset.getEstimatedTransaction(
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

export const ethereumTransferConnector = new EthTransferConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ETH,
  blockchain: Blockchain.ETHEREUM,
  feeCurrency: NativeToken.ETH,
  title: "Ethereum",
  addressPlaceholder: "Recipient ETH address",
  type: TransferModalType.FT,
  assetService: ethereumAsset,
})
