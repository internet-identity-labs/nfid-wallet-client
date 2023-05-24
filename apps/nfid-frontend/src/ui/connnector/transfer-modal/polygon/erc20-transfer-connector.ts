import { DelegationIdentity } from "@dfinity/identity"
import { Erc20EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/erc20-populate-transaction.service"
import { Token } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions, PolygonERC20Svg } from "@nfid-frontend/ui"
import { polygonAsset } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  TokenBalance,
  TokenFee,
  TransferModalType,
} from "../types"
import { makeRootAccountGroupedOptions } from "../util/options"
import { EVMTransferConnector } from "./evm-transfer-connector"

export class PolygonERC20TransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getTokenMetadata(currency: string): Promise<Token> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return { ...this.config, ...token }
  }

  async getAddress(
    address?: string,
    identity?: DelegationIdentity,
  ): Promise<string> {
    return await polygonAsset.getAddress(identity)
  }

  async getBalance(address?: string, currency?: string): Promise<TokenBalance> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return Promise.resolve({
      balance: String(token.balance),
      balanceinUsd: token.balanceinUsd,
    })
  }

  async getTokens(): Promise<Token[]> {
    const identity = await this.getIdentity()
    return (await polygonAsset.getErc20TokensByUser({ identity })).tokens.map(
      (t) => ({ ...t, balance: BigInt(Number(t.balance) / E8S) }),
    )
  }

  async getAccountsOptions(currency?: string): Promise<IGroupedOptions[]> {
    const identity = await this.getIdentity()
    const address = await this.getAddress("", identity)
    const balance = await this.getBalance(currency)

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.balance?.toString() ?? "",
        balance.balanceinUsd,
        currency ?? "",
      ),
    ]
  }

  async getTokenCurrencies(): Promise<string[]> {
    const tokens = await this.getTokens()
    return tokens.map((token) => token.symbol)
  }

  async getTokensOptions(): Promise<IGroupedOptions> {
    const tokens = await this.getTokens()
    return {
      label: this.config.blockchain,
      options: tokens.map((token) => ({
        icon: token.logo ?? this.config.icon,
        title: token.symbol,
        subTitle: token.name,
        value: token.symbol,
      })),
    }
  }

  async getFee({
    to,
    amount,
    currency,
    contract,
  }: ITransferFTRequest): Promise<TokenFee> {
    const cacheKey = currency + "_transaction"

    const identity = await this.getIdentity()
    const request = new Erc20EstimateTransactionRequest(
      identity,
      to,
      contract,
      amount,
    )

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

export const polygonERC20TransferConnector = new PolygonERC20TransferConnector({
  tokenStandard: TokenStandards.ERC20_POLYGON,
  blockchain: Blockchain.POLYGON,
  feeCurrency: NativeToken.MATIC,
  icon: PolygonERC20Svg,
  addressPlaceholder: "Recipient Polygon address",
  type: TransferModalType.FT20,
})
