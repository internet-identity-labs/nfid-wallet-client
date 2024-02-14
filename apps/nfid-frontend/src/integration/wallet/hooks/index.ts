export interface TokenTransferConfig {
  domain?: string
  accountId?: string
  memo?: bigint
  tokenCanisterId?: string
  transformAmount: (amount: string) => number
}
