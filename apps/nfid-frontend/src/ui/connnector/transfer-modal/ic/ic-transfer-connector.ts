import { DelegationIdentity } from "@dfinity/identity"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { accessList } from "@nfid/integration"
import { WALLET_FEE } from "@nfid/integration/token/constants"
import { TokenStandards } from "@nfid/integration/token/types"

import { MAX_DECIMAL_USD_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"

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

    return await getWalletDelegationAdapter(
      neededAccount.account.domain,
      neededAccount.account.accountId,
      targetCanister ? [...accessList, targetCanister] : accessList,
    )
  }

  async getFee(): Promise<TokenFee> {
    const rate = await getExchangeRate()

    return {
      fee: String(WALLET_FEE),
      feeUsd: (WALLET_FEE * rate).toFixed(MAX_DECIMAL_USD_LENGTH),
    }
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
