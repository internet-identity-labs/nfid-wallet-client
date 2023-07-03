import { DelegationIdentity } from "@dfinity/identity"
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import {
  IFungibleAssetDetailsConnector,
  TokenDetailsConfig,
} from "src/ui/connnector/types"

import { authState } from "@nfid/integration"

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

  protected getIdentity = (): DelegationIdentity => {
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) {
      throw Error("Delegation identity error")
    }
    return delegationIdentity
  }

  getCacheTtl(): number {
    return 30
  }
}
