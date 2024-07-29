export type Transaction = {
  _id: string
  buyerPubKey: string
  chain: string
  collectionId: string
  sellerPubKey: string
  tokenAddress: string
  __v: number
  transactionAmount: number
  transactionDate: string
  transctionType: string
  trxStat: string
  trxDetailId: string
  transactionSignature: string
}

export type TransactionApiResponse = {
  status: number
  code: string
  data: Transaction[]
  message: string
}
