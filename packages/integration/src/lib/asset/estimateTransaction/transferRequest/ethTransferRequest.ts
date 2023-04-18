import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { EthTransferRequest } from "../../asset-ethereum"
import { EthEstimatedTransactionRequest } from "../../types"
import { TransferRequest } from "../estimateTransaction"

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
