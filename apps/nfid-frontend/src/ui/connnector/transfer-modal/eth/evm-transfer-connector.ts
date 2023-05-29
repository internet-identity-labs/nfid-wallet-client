import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { ethereumAsset } from "@nfid/integration"

import { connectorCache } from "../../cache"
import { TransferModalConnector } from "../transfer-modal"
import {
  ITransferFTModalConfig,
  ITransferFTRequest,
  ITransferNFTModalConfig,
  ITransferNFTRequest,
  ITransferResponse,
  TokenBalance,
} from "../types"
import { makeRootAccountGroupedOptions } from "../util/options"

export abstract class EVMTransferConnector<
  ConfigType extends ITransferFTModalConfig | ITransferNFTModalConfig,
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

    let result: ITransferResponse

    try {
      if (!transaction)
        throw new Error("Populated transaction not found. Please try again")

      const response = await ethereumAsset.transfer(
        identity,
        transaction.transaction,
      )

      result = {
        status: "ok",
        hash: response.etherscanTransactionUrl,
      }
    } catch (e: any) {
      result = {
        status: "error",
        errorMessage: e.message ?? "Unknown error",
      }
    }

    return result
  }

  validateAddress(address: string): boolean | string {
    if (address.length !== 42) return "Address length should be 42 characters"
    if (!address.startsWith("0x")) return "Address should starts with 0x"

    return true
  }

  async getAddress(): Promise<string> {
    const identity = await this.getIdentity()
    return await ethereumAsset.getAddress(identity)
  }

  async getBalance(): Promise<TokenBalance> {
    const address = await this.getAddress()
    const balance = await ethereumAsset.getBalance(address)

    return {
      balance: String(balance.balance),
      balanceinUsd: String(balance.balanceinUsd?.toFixed(2)),
    }
  }

  async getAccountsOptions(): Promise<IGroupedOptions[]> {
    const address = await this.getAddress()
    const balance = await this.getBalance()

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.balance?.toString() ?? "",
        `$${balance.balanceinUsd ?? "0.00"}`,
        this.config.tokenStandard,
      ),
    ]
  }
}
