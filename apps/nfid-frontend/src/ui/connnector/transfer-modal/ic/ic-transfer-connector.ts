import { DelegationIdentity } from "@dfinity/identity"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { accessList } from "@nfid/integration"
import { ICP_DECIMALS, WALLET_FEE_E8S } from "@nfid/integration/token/constants"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"

import { Blockchain, NativeToken } from "../../types"
import {
  ITransferFTConnector,
  ITransferConfig,
  TransferModalType,
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

    return await getWalletDelegationAdapter(
      neededAccount.account.domain,
      neededAccount.account.accountId,
      targetCanister ? [...accessList, targetCanister] : accessList,
    )
  }

  async getFee(): Promise<bigint> {
    return BigInt(WALLET_FEE_E8S)
  }

  async getDecimals() {
    return ICP_DECIMALS
  }
}

export const icTransferConnector = new ICTransferConnector({
  icon: IconSvgDfinity,
  tokenStandard: TokenStandards.ICP,
  feeCurrency: NativeToken.ICP,
  blockchain: Blockchain.IC,
  title: "Internet Computer",
  addressPlaceholder: "Recipient wallet address or account ID",
  type: TransferModalType.FT,
  isNativeToken: true,
  duration: "10 sec",
})
