import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { Cache } from "node-ts-cache"

import { getBalance } from "@nfid/integration"
import { WALLET_FEE, transfer as submitICP } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { PRINCIPAL_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"
import { connectorCache } from "frontend/ui/connnector/cache"
import { getICPublicDelegation } from "frontend/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"
import { TokenFee } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain, NativeToken } from "frontend/ui/connnector/types"

import {
  IRequestTransfer,
  IRequestTransferConnector,
  IRequestTransferResponse,
  RequestTransferConfig,
  TransferStatus,
} from "../types"

export class ICRequestTransferConnector<T extends RequestTransferConfig>
  implements IRequestTransferConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  @Cache(connectorCache, { ttl: 10 })
  async getRate() {
    return await getExchangeRate()
  }

  getFee(): Promise<TokenFee> {
    return Promise.resolve({
      fee: String(WALLET_FEE),
      feeUsd: String(WALLET_FEE),
    })
  }

  @Cache(connectorCache, { ttl: 10 })
  async getBalance(): Promise<number> {
    const identity = await this.getIdentity()
    const balance = await getBalance(
      principalToAddress(identity.getPrincipal()),
    )

    return Number(e8sICPToString(Number(balance)))
  }

  async transfer(request: IRequestTransfer): Promise<IRequestTransferResponse> {
    if (!request.amount)
      return {
        status: TransferStatus.ERROR,
        message: "Amount is required",
      }

    if (!request.identity)
      return {
        status: TransferStatus.ERROR,
        message: "Identity is required",
      }

    if (!request.to)
      return {
        status: TransferStatus.ERROR,
        message: "Receiver address is required",
      }

    try {
      const res = await submitICP(
        stringICPtoE8s(String(request.amount)),
        request.to.length === PRINCIPAL_LENGTH
          ? principalToAddress(Principal.fromText(request.to))
          : request.to,
        request.identity,
      )

      return {
        status: TransferStatus.SUCCESS,
        blockIndex: Number(res),
      }
    } catch (e: any) {
      return {
        status: TransferStatus.REJECTED,
        message: e.message,
      }
    }
  }

  async getIdentity(): Promise<DelegationIdentity> {
    return await getICPublicDelegation()
  }
}

export const icRequestTransferConnector = new ICRequestTransferConnector({
  tokenStandard: TokenStandards.ICP,
  feeCurrency: NativeToken.ICP,
  blockchain: Blockchain.IC,
})
