import { authStorage } from "@nfid/integration"

import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefImpl implements UserPreferences {
  private hideZeroBalance: boolean
  private slippage: number

  constructor() {
    this.hideZeroBalance = false
    this.slippage = 2
  }

  setHideZeroBalance(hideZeroBalance: boolean): Promise<void> {
    this.hideZeroBalance = hideZeroBalance
    return authStorage.set("userPreferences", this.toJSON())
  }

  isHideZeroBalance(): boolean {
    return this.hideZeroBalance
  }

  setSlippage(slippage: number): Promise<void> {
    this.slippage = slippage
    return authStorage.set("userPreferences", this.toJSON())
  }

  getSlippage(): number {
    return this.slippage
  }

  private toJSON(): string {
    return JSON.stringify({
      hideZeroBalance: this.hideZeroBalance,
      slippage: this.slippage,
    })
  }

  static fromJSON(json: string): UserPrefImpl {
    const data = JSON.parse(json)
    const instance = new UserPrefImpl()
    instance.hideZeroBalance = data.hideZeroBalance ?? false
    instance.slippage = data.slippage ?? 2
    return instance
  }
}
