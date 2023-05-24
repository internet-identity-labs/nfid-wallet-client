import { DelegationIdentity } from "@dfinity/identity"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { WALLET_FEE } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { Blockchain } from "../../types"
import {
  ITransferFTConnector,
  ITransferConfig,
  TokenFee,
  TransferModalType,
} from "../types"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class ICTransferConnector
  extends ICMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  getFee(): Promise<TokenFee> {
    return Promise.resolve({
      fee: String(WALLET_FEE),
      feeUsd: String(WALLET_FEE),
    })
  }

  async getIdentity(address: string): Promise<DelegationIdentity> {
    const profile = await this.getProfile()
    const allAccounts = await this.getAllPrincipals(false)

    const neededAccount = allAccounts.find(
      (acc) => acc.principal.toString() === address,
    )
    if (!neededAccount) throw new Error("Account not found")

    return await getWalletDelegation(
      profile.anchor,
      neededAccount?.account.domain,
      neededAccount?.account.accountId,
    )
  }
}

export const icTransferConnector = new ICTransferConnector({
  icon: IconSvgDfinity,
  tokenStandard: TokenStandards.ICP,
  blockchain: Blockchain.IC,
  title: "Internet Computer",
  shouldHavePrincipal: true,
  addressPlaceholder: "Recipient IC address or principal",
  type: TransferModalType.FT,
})
