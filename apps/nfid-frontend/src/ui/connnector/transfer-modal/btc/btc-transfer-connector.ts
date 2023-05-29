import { getPrice } from "packages/integration/src/lib/asset/asset-util"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { BtcWallet } from "packages/integration/src/lib/bitcoin-wallet/btc-wallet"

import { IGroupedOptions, IconSvgBTC } from "@nfid-frontend/ui"
import { E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { e8sICPToString } from "frontend/integration/wallet/utils"

import { Blockchain, NativeToken } from "../../types"
import { TransferModalConnector } from "../transfer-modal"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  ITransferResponse,
  TokenBalance,
  TokenFee,
  TransferModalType,
} from "../types"
import { makeRootAccountGroupedOptions } from "../util/options"
import { Cache } from "node-ts-cache"
import { connectorCache } from "../../cache"

export class BtcTransferConnector
  extends TransferModalConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getAddress(): Promise<string> {
    const identity = await this.getIdentity()
    return await new BtcAsset().getAddress(identity)
  }

  async getBalance(): Promise<TokenBalance> {
    const identity = await this.getIdentity()
    const tokenSheet = await new BtcAsset().getRootAccount(identity)

    return {
      balance: e8sICPToString(Number(tokenSheet.tokenBalance)),
      balanceinUsd: tokenSheet.usdBalance,
    }
  }

  @Cache(connectorCache, {ttl: 60})
  async getAccountsOptions(): Promise<IGroupedOptions[]> {
    const address = await this.getAddress()
    const balance = await this.getBalance()

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.balance?.toString() ?? "",
        balance.balanceinUsd,
        this.config.tokenStandard,
      ),
    ]
  }

  validateAddress(address: string): boolean | string {
    if (address.length < 26 || address.length > 35)
      return "Address length should be from 27 to 34 characters"

    return true
  }

  async getFee({ to, amount }: ITransferFTRequest): Promise<TokenFee> {
    const identity = await this.getIdentity()
    const fee = await new BtcWallet(identity).getFee(to, amount)
    const rate = await getPrice(["BTC"])

    return {
      fee: `${e8sICPToString(Number(fee))} ${this.config.feeCurrency}`,
      feeUsd: String(Number(rate[0].price) * (fee / E8S)),
    }
  }

  async transfer(request: ITransferFTRequest): Promise<ITransferResponse> {
    const identity = await this.getIdentity()

    let result: ITransferResponse

    try {
      const response = await new BtcAsset().transfer(identity, request)

      result = {
        status: "ok",
        hash: response,
      }
    } catch (e: any) {
      result = {
        status: "error",
        errorMessage: e.message ?? "Unknown error",
      }
    }

    return result
  }
}

export const btcTransferConnector = new BtcTransferConnector({
  icon: IconSvgBTC,
  tokenStandard: TokenStandards.BTC,
  blockchain: Blockchain.BITCOIN,
  feeCurrency: NativeToken.BTC,
  title: "Bitcoin",
  addressPlaceholder: "Recipient Bitcoin address",
  type: TransferModalType.FT,
})
