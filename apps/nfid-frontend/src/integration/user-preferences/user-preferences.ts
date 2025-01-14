export interface UserPreferences {
  isHideZeroBalance(): boolean
  setHideZeroBalance(hideZeroBalance: boolean): Promise<void>
  getSlippage(): number
  setSlippage(slippage: number): Promise<void>
}
