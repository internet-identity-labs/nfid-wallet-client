import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefImpl implements UserPreferences {
  private hideZeroBalance: boolean
  private testnetEnabled: boolean
  private slippage: number
  private arbitrumEnabled: boolean
  private baseEnabled: boolean
  private polygonEnabled: boolean

  constructor() {
    this.hideZeroBalance = true
    this.testnetEnabled = true

    this.arbitrumEnabled = true
    this.baseEnabled = true
    this.polygonEnabled = true

    this.slippage = 2
  }

  setHideZeroBalance(hideZeroBalance: boolean): Promise<void> {
    this.hideZeroBalance = hideZeroBalance
    return authStorage.set("userPreferences", this.toJSON())
  }

  isHideZeroBalance(): boolean {
    return this.hideZeroBalance
  }

  isTestnetEnabled(): boolean {
    return this.testnetEnabled
  }

  setTestnetEnabled(testnetEnabled: boolean): Promise<void> {
    this.testnetEnabled = testnetEnabled
    return authStorage.set("userPreferences", this.toJSON())
  }

  isArbitrumEnabled(): boolean {
    return this.arbitrumEnabled
  }

  setArbitrumEnabled(arbitrumEnabled: boolean): Promise<void> {
    this.arbitrumEnabled = arbitrumEnabled
    return authStorage.set("userPreferences", this.toJSON())
  }

  isBaseEnabled(): boolean {
    return this.baseEnabled
  }

  setBaseEnabled(baseEnabled: boolean): Promise<void> {
    this.baseEnabled = baseEnabled
    return authStorage.set("userPreferences", this.toJSON())
  }

  isPolygonEnabled(): boolean {
    return this.polygonEnabled
  }

  setPolygonEnabled(polygonEnabled: boolean): Promise<void> {
    this.polygonEnabled = polygonEnabled
    return authStorage.set("userPreferences", this.toJSON())
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
      testnetEnabled: this.testnetEnabled,
      arbitrumEnabled: this.arbitrumEnabled,
      baseEnabled: this.baseEnabled,
      polygonEnabled: this.polygonEnabled,
    })
  }

  static fromJSON(json: string): UserPrefImpl {
    const data = JSON.parse(json)
    const instance = new UserPrefImpl()
    instance.hideZeroBalance = data.hideZeroBalance ?? true
    instance.testnetEnabled = data.testnetEnabled ?? true
    instance.arbitrumEnabled = data.arbitrumEnabled ?? true
    instance.baseEnabled = data.baseEnabled ?? true
    instance.polygonEnabled = data.polygonEnabled ?? true
    instance.slippage = data.slippage ?? 2
    return instance
  }
}
