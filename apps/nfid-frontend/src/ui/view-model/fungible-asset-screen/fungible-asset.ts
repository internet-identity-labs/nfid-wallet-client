import { DelegationIdentity } from "@dfinity/identity"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { IFungibleAssetConnector, TokenConfig } from "src/ui/view-model/types"

import { loadProfileFromLocalStorage } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

export abstract class FungibleAssetConnector implements IFungibleAssetConnector {
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
