import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { ProviderError } from "@nfid/integration"

export function calcPriceDeployCollection(
  rate: number,
  populatedTransaction?: [TransactionRequest, ProviderError | undefined],
) {
  if (!rate || !populatedTransaction || !populatedTransaction[0])
    return {
      feeUsd: "0",
      fee: "0",
      maxFeeUsd: "0",
      maxFee: "0",
      isInsufficientFundsError: false,
      isNetworkIsBusyWarning: false,
    }
  const [transaction, err] = populatedTransaction

  const gasPriceRaw = transaction.gasPrice
  delete transaction["gasPrice"]

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const gasPrice = BigNumber.from(gasPriceRaw ?? transaction?.maxFeePerGas)
  const maxFeePerGas = BigNumber.from(transaction?.maxFeePerGas ?? gasPriceRaw)
  const fee = gasLimit.mul(gasPrice).div(125).mul(100)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rate
  const maxFee = gasLimit.mul(maxFeePerGas)
  const maxFeeUsd = parseFloat(ethers.utils.formatEther(maxFee)) * rate

  return {
    feeUsd: feeUsd.toFixed(2),
    fee: ethers.utils.formatEther(fee),
    maxFeeUsd: maxFeeUsd.toFixed(2),
    maxFee: ethers.utils.formatEther(maxFee),
    isInsufficientFundsError: err ?? ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: err ?? ProviderError.NETWORK_BUSY === err,
  }
}
