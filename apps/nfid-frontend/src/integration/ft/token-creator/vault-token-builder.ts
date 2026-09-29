import { SignIdentity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import { FT } from "../ft"
import { FTVaultImpl } from "../impl/ft-vault-impl"
import { TokenBuilder } from "./token-builder"

export class VaultTokenBuilder implements TokenBuilder<ICRC1> {
  constructor(
    private readonly vaultCanisterId: string,
    private readonly vaultPrincipal: Principal,
    private readonly identity: SignIdentity,
  ) {}

  buildNative(): FT {
    throw new Error("VaultTokenBuilder does not implement buildNative")
  }

  buildTokens(tokenData: ICRC1): FT {
    return new FTVaultImpl(tokenData, this.vaultCanisterId, this.vaultPrincipal, this.identity)
  }
}
