export interface UserPreferences {
  isHideZeroBalance(): boolean
  setHideZeroBalance(hideZeroBalance: boolean): Promise<void>
  getSlippage(): number
  setSlippage(slippage: number): Promise<void>
  isTestnetEnabled(): boolean
  setTestnetEnabled(testnetEnabled: boolean): Promise<void>
  isArbitrumEnabled(): boolean
  setArbitrumEnabled(arbitrumEnabled: boolean): Promise<void>
  isBaseEnabled(): boolean
  setBaseEnabled(baseEnabled: boolean): Promise<void>
  isPolygonEnabled(): boolean
  setPolygonEnabled(polygonEnabled: boolean): Promise<void>
}
