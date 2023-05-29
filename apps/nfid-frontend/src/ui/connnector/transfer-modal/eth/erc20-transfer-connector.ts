import { Erc20EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/erc20-populate-transaction.service"
import { Token } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions, IconERC20 } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferFT20Connector,
  ITransferFT20ModalConfig,
  ITransferFTRequest,
  TokenBalance,
  TokenFee,
} from "../types"
import { makeRootAccountGroupedOptions } from "../util/options"
import { EVMTransferConnector } from "./evm-transfer-connector"

export class EthERC20TransferConnector
  extends EVMTransferConnector<ITransferFT20ModalConfig>
  implements ITransferFT20Connector
{
  async getTokenMetadata(currency: string): Promise<Token> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return { ...this.config, ...token }
  }

  async getBalance(address?: string, currency?: string): Promise<TokenBalance> {
    const tokens = await this.getTokens()
    const token = tokens.find((t) => t.symbol === currency)!

    return Promise.resolve({
      balance: String(token.balance),
      balanceinUsd: token.balanceinUsd,
    })
  }

  async getTokenCurrencies(): Promise<string[]> {
    const tokens = await this.getTokens()
    return tokens.map((token) => token.symbol)
  }

  async getTokens(): Promise<Token[]> {
    const identity = await this.getIdentity()
    return (await ethereumAsset.getErc20TokensByUser({ identity })).tokens.map(
      (t) => ({ ...t, balance: BigInt(Number(t.balance) / E8S) }),
    )
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

  async getAccountsOptions(
    _?: string,
    currency?: string,
  ): Promise<IGroupedOptions[]> {
    const address = await this.getAddress()
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

  async getFee({
    to,
    amount,
    contract,
    currency,
  }: ITransferFTRequest): Promise<TokenFee> {
    const cacheKey = currency + "_transaction"
    const identity = await this.getIdentity()
    const request = new Erc20EstimateTransactionRequest(
      identity,
      to,
      contract,
      amount,
    )

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

export const ethereumERC20TransferConnector = new EthERC20TransferConnector({
  tokenStandard: TokenStandards.ERC20_ETHEREUM,
  blockchain: Blockchain.ETHEREUM,
  feeCurrency: NativeToken.ETH,
  icon: IconERC20,
  addressPlaceholder: "Recipient ETH address",
  type: "ft20",
})
