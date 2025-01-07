import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefImpl implements UserPreferences {
  private hideZeroBalance: boolean

  constructor() {
    this.hideZeroBalance = false
  }

  setHideZeroBalance(hideZeroBalance: boolean): Promise<void> {
    this.hideZeroBalance = hideZeroBalance
    return authStorage.set("userPreferences", this.toJSON(this))
  }

  isHideZeroBalance(): boolean {
    return this.hideZeroBalance
  }

  private toJSON(userPref: UserPreferences): string {
    return JSON.stringify({
      hideZeroBalance: userPref.isHideZeroBalance(),
    })
  }
}
