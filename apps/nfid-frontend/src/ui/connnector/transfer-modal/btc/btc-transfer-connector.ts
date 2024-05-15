import { DelegationIdentity } from "@dfinity/identity"
import { toBn } from "@rarible/utils"
import { Cache } from "node-ts-cache"
import { PriceService } from "packages/integration/src/lib/asset/asset-util"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { BtcWallet } from "packages/integration/src/lib/bitcoin-wallet/btc-wallet"

import { IGroupedOptions, IconSvgBTC } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { e8sICPToString } from "frontend/integration/wallet/utils"

import { connectorCache } from "../../cache"
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

export class BtcTransferConnector
  extends TransferModalConnector<ITransferConfig>
  implements ITransferFTConnector
{
  @Cache(connectorCache, { ttl: 30 })
  async getAddress(): Promise<string> {
    const identity = await this.getIdentity()
    return await new BtcAsset().getAddress(identity)
  }

  @Cache(connectorCache, { ttl: 30 })
  async getBalance(): Promise<TokenBalance> {
    const identity = await this.getIdentity()
    const tokenSheet = await new BtcAsset().getRootAccount(identity)

    return {
      balance: e8sICPToString(Number(tokenSheet.tokenBalance)),
      balanceinUsd: tokenSheet.usdBalance,
    }
  }

  @Cache(connectorCache, { ttl: 60 })
  async getAccountsOptions(): Promise<IGroupedOptions[]> {
    const address = await this.getAddress()
    const balance = await this.getBalance()

    return [
      makeRootAccountGroupedOptions(
        address,
        balance.balance?.toString() ?? "",
        balance.balanceinUsd ?? "",
        this.config.tokenStandard,
      ),
    ]
  }

  validateAddress(address: string): boolean | string {
    if (address.length < 26 || address.length > 35)
      return "Address length should be from 27 to 34 characters"

    return true
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({ to, amount }: ITransferFTRequest): Promise<TokenFee> {
    const identity = await this.getIdentity()
    const fee = await new BtcWallet(identity).getFee(
      to,
      toBn(amount).multipliedBy(E8S).toNumber(),
    )
    const rate = await new PriceService().getPrice(["BTC"])

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
        url: `https://live.blockcypher.com/btc-testnet/tx/${response}/`,
      }
    } catch (e: any) {
      result = {
        errorMessage: e.message ?? "Unknown error",
      }
    }

    return result
  }

  getIdentity = (): Promise<DelegationIdentity> => {
    return new Promise((resolve, reject) => {
      const { delegationIdentity } = authState.get()
      if (!delegationIdentity) {
        reject(Error("Delegation identity error"))
      } else {
        resolve(delegationIdentity)
      }
    })
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
  isNativeToken: true,
  duration: "1.5 hours",
})
