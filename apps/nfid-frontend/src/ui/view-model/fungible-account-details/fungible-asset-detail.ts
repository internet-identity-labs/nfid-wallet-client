import { DelegationIdentity } from "@dfinity/identity"
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { IFungibleAccountView } from "src/ui/view-model/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export abstract class FungibleAssetDetailsView implements IFungibleAccountView {
  protected config: any

  constructor(config: any) {
    this.config = config
  }

  abstract getAssetDetails(): Promise<Array<TokenBalanceSheet>>

  getTokenStandard(): TokenStandards {
    return this.config.tokenStandard
  }

  protected getIdentity = async (): Promise<DelegationIdentity> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    return await getWalletDelegation(profile.anchor, "nfid.one", "0")
  }
}
