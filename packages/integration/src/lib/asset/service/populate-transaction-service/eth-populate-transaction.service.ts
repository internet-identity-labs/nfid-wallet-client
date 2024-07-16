import { DelegationIdentity } from "@dfinity/identity"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { ErrorCode } from "../../error-code.enum"
import { PopulateTransactionService } from "../../service/estimate-transaction.service"
import { EstimateTransactionRequest } from "../../types"
import { alchemyService } from "../alchemy.service"

export class EthTransferRequest implements EstimateTransactionRequest {
  readonly type = "EthTransferRequest"
  constructor(
    readonly identity: DelegationIdentity,
    readonly to: string,
    readonly amount: number,
  ) {}
}

export const ethPopulateTransactionService: PopulateTransactionService = {
  populate: async (
    from: string,
    wallet: EthWalletV2,
    request: EstimateTransactionRequest,
    { maxFeePerGas, maxPriorityFeePerGas }: ethers.providers.FeeData,
    nonce: number,
    chainId: number,
  ) => {
    const errors: ErrorCode[] = []
    const { amount } = request as EthTransferRequest
    let value

    try {
      value = ethers.utils.parseEther(amount ? amount.toString() : "0")
    } catch (e) {
      value = ethers.utils.parseEther("0")
    }

    const tx: ethers.providers.TransactionRequest = {
      to: request.to,
      from,
      nonce,
      maxFeePerGas: maxFeePerGas || undefined,
      maxPriorityFeePerGas: maxPriorityFeePerGas || undefined,
      value,
    }

    try {
      const populatedTransaction = await wallet.populateTransaction(tx)
      return { populatedTransaction, errors }
    } catch (error) {
      if ((error as { code: string }).code === "INSUFFICIENT_FUNDS") {
        errors.push(ErrorCode.INSUFFICIENT_FUNDS)
      }
      const tempTx = { ...tx }
      delete tempTx["from"]
      tempTx["value"] = ethers.utils.parseEther("0")
      const gasLimit = await alchemyService.estimateGas(chainId, tempTx)
      const populatedTransaction = { ...tx, gasLimit }
      return { populatedTransaction, errors }
    }
  },
}
