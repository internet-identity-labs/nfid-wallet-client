import { SignIdentity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

import { nfidVaultsService } from "@nfid/integration"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import { FT } from "../ft"
import { FTImpl } from "./ft-impl"

export class FTVaultImpl extends FTImpl {
  constructor(
    icrc1: ICRC1,
    private readonly vaultCanisterId: string,
    private readonly vaultPrincipal: Principal,
    private readonly identity: SignIdentity,
  ) {
    super(icrc1)
  }

  async init(_principal: Principal): Promise<FT> {
    await this.getBalance(this.vaultPrincipal)
    return this
  }

  async refreshBalance(_principal: Principal): Promise<FT> {
    return this.init(this.vaultPrincipal)
  }

  isHideable(): boolean {
    return this.tokenAddress !== ICP_CANISTER_ID
  }

  async hideToken(): Promise<void> {
    await nfidVaultsService.removeIcrc1Canister(
      this.vaultCanisterId,
      this.identity,
      this.tokenAddress,
    )
    this.tokenState = State.Inactive
  }

  async showToken(): Promise<void> {
    await nfidVaultsService.addIcrc1Canister(
      this.vaultCanisterId,
      this.identity,
      this.tokenAddress,
    )
    this.tokenState = State.Active
  }
}
