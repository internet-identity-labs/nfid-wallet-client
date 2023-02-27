import { TransactionRequest } from "@ethersproject/abstract-provider"

export type PreparedSignatureResponse = {
  hash: string
  message: Uint8Array
  tx: TransactionRequest
}
