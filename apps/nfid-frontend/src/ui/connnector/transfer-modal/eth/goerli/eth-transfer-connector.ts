import { Cache } from "node-ts-cache"
import { EthTransferRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/eth-populate-transaction.service"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "frontend/ui/connnector/cache"
import { Blockchain, NativeToken } from "frontend/ui/connnector/types"

import { EVMTransferConnector } from "../../evm-transfer-connector"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  TokenFee,
  TransferModalType,
} from "../../types"

export class EthGoerliTransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  @Cache(connectorCache, { ttl: 10 })
  async getFee({
    to,
    amount,
    currency,
  }: ITransferFTRequest): Promise<TokenFee> {
    const cacheKey = currency + "_transaction"

    const identity = await this.getIdentity()
    const request = new EthTransferRequest(identity, to, amount)
    const estimatedTransaction =
      await ethereumGoerliAsset.getEstimatedTransaction(request)
    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return {
      fee: `${estimatedTransaction.fee} ${this.config.feeCurrency}`,
      feeUsd: estimatedTransaction.feeUsd,
    }
  }
}

// export const ethereumGoerliTransferConnector = new EthGoerliTransferConnector({
//   icon: IconPngEthereum,
//   tokenStandard: TokenStandards.ETH,
//   blockchain: Blockchain.ETHEREUM_GOERLI,
//   feeCurrency: NativeToken.ETH,
//   addressPlaceholder: "Recipient ETH address",
//   type: TransferModalType.FT,
//   assetService: ethereumGoerliAsset,
//   isNativeToken: true,
//   duration: "10 min",
// })
