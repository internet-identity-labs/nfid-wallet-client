import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefImpl implements UserPreferences {
  private hideZeroBalance: boolean

  constructor() {
    this.hideZeroBalance = false
  }

  setHideZeroBalance(hideZeroBalance: boolean): Promise<void> {
    this.hideZeroBalance = hideZeroBalance
    return authStorage.set("userPreferences", this.toJSON())
  }

  isHideZeroBalance(): boolean {
    return this.hideZeroBalance
  }

  private toJSON(): string {
    return JSON.stringify({
      hideZeroBalance: this.hideZeroBalance,
    })
  }

  static fromJSON(json: string): UserPrefImpl {
    const data = JSON.parse(json)
    const instance = new UserPrefImpl()
    instance.hideZeroBalance = data.hideZeroBalance
    return instance
  }
}
