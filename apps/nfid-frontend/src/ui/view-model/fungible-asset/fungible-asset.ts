import { DelegationIdentity } from "@dfinity/identity"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import {
  FungibleAssetViewI,
  TokenConfig,
} from "src/ui/view-model/fungible-asset/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export abstract class FungibleAssetView implements FungibleAssetViewI {
  protected config: any

  constructor(config: any) {
    this.config = config
  }

  abstract getTokenConfigs(): Promise<Array<TokenConfig>>

  getTokenStandard(): TokenStandards {
    return this.config.tokenStandard
  }

  protected getIdentity = async (): Promise<DelegationIdentity> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    return await getWalletDelegation(profile.anchor, "nfid.one", "0")
  }
}
