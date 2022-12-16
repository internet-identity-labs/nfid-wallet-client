import { Account, Balance } from "@nfid/integration"

export type Token = string

export type TokenBalance = {
  [token: Token]: Balance
}

export type RawBalance = {
  principalId: string
  account: Account
  balance: TokenBalance
}

export interface AccountBalance {
  accountName: string
  tokenBalance: Balance
  usdBalance: string
  principalId: string
  address: string
}

export interface AppBalance {
  icon?: string
  appName: string
  tokenBalance: Balance
  accounts: AccountBalance[]
}

export interface TokenBalanceSheet {
  label: string
  token: string
  icon: string
  tokenBalance: Balance
  usdBalance: string
  applications: { [applicationName: string]: AppBalance | undefined }
}
