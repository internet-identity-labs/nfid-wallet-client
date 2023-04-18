import { DelegationIdentity } from "@dfinity/identity"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import {
  EstimatedTransactionRequest,
  EthEstimatedTransactionRequest,
} from "../../types"
import { TransferRequest } from "../estimateTransaction"

export class EthTransferRequest implements EstimatedTransactionRequest {
  constructor(
    readonly identity: DelegationIdentity,
    readonly to: string,
    readonly amount: number,
  ) {}
}

export const ethTransferRequest: TransferRequest = {
  estimate: (
    from: string,
    wallet: EthWalletV2,
    request: EthEstimatedTransactionRequest,
  ) => {
    const { amount } = request as EthTransferRequest
    const value = ethers.utils.parseEther(amount.toString())
    return Promise.resolve({ value })
  },
}
