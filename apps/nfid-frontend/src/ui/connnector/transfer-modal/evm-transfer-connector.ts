import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import { connectorCache } from "../cache"
import { TransferModalConnector } from "./transfer-modal"
import {
  ITransferConfig,
  ITransferFTRequest,
  ITransferNFTRequest,
  ITransferResponse,
} from "./types"
import { makeRootAccountGroupedOptions } from "./util/options"

export abstract class EVMTransferConnector<
  ConfigType extends ITransferConfig,
> extends TransferModalConnector<ConfigType> {
  async transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse> {
    const cacheKey =
      "tokenId" in request
        ? `nft_${request.tokenId}_transaction`
        : `${request.currency}_transaction`

    const identity = await this.getIdentity()
    const transaction = await connectorCache.getItem<EstimatedTransaction>(
      cacheKey,
    )

    if (transaction?.errors?.length)
      return {
        errorMessage: new Error(
          `Insufficient ${this.config.feeCurrency} balance for transaction`,
        ),
      }

    let result: ITransferResponse

    try {
      if (!transaction)
        throw new Error("Populated transaction not found. Please try again")

      const response = await this.config.assetService.transfer(
        identity,
        transaction.transaction,
      )

      result = {
        verifyPromise: response.waitOnChain,
        url: response.etherscanTransactionUrl,
      }
    } catch (e: any) {
      result = {
        errorMessage:
          e.message ??
          `Insufficient ${this.config.feeCurrency} balance for transaction`,
      }
    }

    return result
  }

  validateAddress(address: string): boolean | string {
    if (address.length !== 42) return "Address length should be 42 characters"
    if (!address.startsWith("0x")) return "Address should starts with 0x"

    return true
  }

  @Cache(connectorCache, { ttl: 60 })
  async getAddress(): Promise<string> {
    const identity = await this.getIdentity()
    return await this.config.assetService.getAddress(identity)
  }

  async getBalance(): Promise<bigint> {
    const address = await this.getAddress()
    const balance = await this.config.assetService.getBalance(address)

    return balance
  }

  async getAccountsOptions({
    currency,
  }: {
    currency?: string
  }): Promise<IGroupedOptions[]> {
    const address = await this.getAddress()
    const balance = await this.getBalance()

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.toString() ?? "",
        undefined,
        this.config.tokenStandard,
      ),
    ]
  }

  async getDecimals() {
    return 8
  }

  async getIdentity(): Promise<DelegationIdentity> {
    const { delegationIdentity } = authState.get()

    return delegationIdentity!
  }
}
