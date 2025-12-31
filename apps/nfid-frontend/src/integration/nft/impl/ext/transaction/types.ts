export interface TransactionToniq {
  id: string
  token: string
  canister: string
  time: number
  seller: string
  buyer: string
  price: number
}

export interface ResponseData {
  id: string
  owner: string
  canister: string
  price: number
  time: number
  metadata: string
  transactions: TransactionToniq[]
}
