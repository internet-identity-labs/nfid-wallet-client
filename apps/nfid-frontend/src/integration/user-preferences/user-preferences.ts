export interface UserPreferences {
  isHideZeroBalance(): boolean
  setHideZeroBalance(hideZeroBalance: boolean): Promise<void>
}
