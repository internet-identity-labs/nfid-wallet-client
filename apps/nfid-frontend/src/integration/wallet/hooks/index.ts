export interface TokenTransferConfig {
  domain?: string
  accountId?: string
  tokenCanisterId?: string
  transformAmount: (amount: string) => number
}
