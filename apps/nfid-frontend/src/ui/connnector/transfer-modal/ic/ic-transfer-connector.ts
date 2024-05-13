import { DelegationIdentity } from "@dfinity/identity"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { accessList } from "@nfid/integration"
import { WALLET_FEE } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"

import { Blockchain, NativeToken } from "../../types"
import {
  ITransferFTConnector,
  ITransferConfig,
  TransferModalType,
  TokenFee,
} from "../types"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class ICTransferConnector
  extends ICMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  async getIdentity(
    address: string,
    targetCanister?: string,
  ): Promise<DelegationIdentity> {
    const allAccounts = await this.getAllPrincipals(false)

    const neededAccount = allAccounts.find(
      (acc) => acc.principal.toString() === address,
    )
    if (!neededAccount) throw new Error("Account not found")

    console.log("targetCanister!!", targetCanister, accessList)

    return await getWalletDelegationAdapter(
      neededAccount.account.domain,
      neededAccount.account.accountId,
      targetCanister ? [...accessList, targetCanister] : accessList,
    )
  }

  getFee(): Promise<TokenFee> {
    return Promise.resolve({
      fee: `${String(WALLET_FEE)}`,
      feeUsd: String(WALLET_FEE),
    })
  }
}

export const icTransferConnector = new ICTransferConnector({
  icon: IconSvgDfinity,
  tokenStandard: TokenStandards.ICP,
  feeCurrency: NativeToken.ICP,
  blockchain: Blockchain.IC,
  title: "Internet Computer",
  shouldHavePrincipal: true,
  addressPlaceholder: "Recipient IC address or principal",
  type: TransferModalType.FT,
  isNativeToken: true,
  duration: "10 sec",
})
