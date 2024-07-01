import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import { Erc20EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/erc20-populate-transaction.service"
import { Token } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions, PolygonERC20Svg } from "@nfid-frontend/ui"
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
import { makeRootAccountGroupedOptions } from "../../util/options"

export class PolygonMumbaiERC20TransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  @Cache(connectorCache, { ttl: 600 })
  async getTokenMetadata(currency: string): Promise<Token> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return { ...this.config, ...token }
  }

  @Cache(connectorCache, { ttl: 600 })
  async getAddress(_?: string, identity?: DelegationIdentity): Promise<string> {
    return await polygonMumbaiAsset.getAddress(identity)
  }

  @Cache(connectorCache, { ttl: 10 })
  async getBalance(_?: string, currency?: string): Promise<bigint> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return BigInt(token.balance)
  }

  @Cache(connectorCache, { ttl: 10 })
  async getTokens(): Promise<Token[]> {
    const identity = await this.getIdentity()
    return (await polygonMumbaiAsset.getErc20TokensByUser({ identity })).tokens
  }

  @Cache(connectorCache, { ttl: 10 })
  async getAccountsOptions({
    currency,
  }: {
    currency?: string
  }): Promise<IGroupedOptions[]> {
    const identity = await this.getIdentity()
    const address = await this.getAddress("", identity)
    const balance = await this.getBalance(currency)

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.toString() ?? "",
        undefined,
        currency ?? "",
      ),
    ]
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokenCurrencies(): Promise<string[]> {
    const tokens = await this.getTokens()
    return tokens.map((token) => token.symbol)
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokensOptions(): Promise<IGroupedOptions> {
    const tokens = await this.getTokens()

    return {
      label: this.config.blockchain,
      options: tokens.map((token) => ({
        icon: token.logo ?? this.config.icon,
        title: token.symbol,
        subTitle: token.name,
        value: `${token.symbol}&${this.config.blockchain}`,
      })),
    }
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({
    to,
    amount,
    currency,
    contract,
  }: ITransferFTRequest): Promise<bigint> {
    const cacheKey = currency + "_transaction"

    const identity = await this.getIdentity()
    const request = new Erc20EstimateTransactionRequest(
      identity,
      to,
      contract,
      amount as any,
    )

    const estimatedTransaction =
      await polygonMumbaiAsset.getEstimatedTransaction(request)

    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return BigInt(estimatedTransaction.fee)
  }
}

export const polygonMumbaiERC20TransferConnector =
  new PolygonMumbaiERC20TransferConnector({
    tokenStandard: TokenStandards.ERC20_POLYGON,
    blockchain: Blockchain.POLYGON_MUMBAI,
    feeCurrency: NativeToken.MATIC,
    icon: PolygonERC20Svg,
    addressPlaceholder: "Recipient Polygon address",
    type: TransferModalType.FT20,
    assetService: polygonMumbaiAsset,
    duration: "10 min",
  })
