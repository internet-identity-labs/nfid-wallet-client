import { DelegationIdentity } from "@dfinity/identity"
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import {
  IFungibleAssetDetailsConnector,
  TokenDetailsConfig,
} from "src/ui/connnector/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"

export abstract class FungibleAssetDetailsConnector
  implements IFungibleAssetDetailsConnector
{
  protected config: TokenDetailsConfig

  constructor(config: TokenDetailsConfig) {
    this.config = config
  }

  abstract getAssetDetails(): Promise<Array<TokenBalanceSheet>>

  getTokenStandard(): string {
    return `${this.config.tokenStandard}&${this.config.blockchain}`
  }

  protected getIdentity = async (): Promise<DelegationIdentity> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    // FIXME:
    // what to do here
    return await getWalletDelegation(profile.anchor, "nfid.one", "0")
  }

  getCacheTtl(): number {
    return 30
  }
}
