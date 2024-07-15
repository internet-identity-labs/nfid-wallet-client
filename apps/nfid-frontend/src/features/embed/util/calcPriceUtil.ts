import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { ProviderError } from "@nfid/integration"

export function calcPrice(
  rate: number,
  populatedTransaction?: [TransactionRequest, ProviderError | undefined],
) {
  if (!rate || !populatedTransaction || !populatedTransaction[0])
    return {
      fee: "0",
      feeUsd: "0",
      maxFee: "0",
      maxFeeUsd: "0",
      total: "0",
      totalUsd: "0",
      maxTotal: "0",
      maxTotalUsd: "0",
      price: "0",
      isInsufficientFundsError: false,
      isNetworkIsBusyWarning: false,
    }

  const [transaction, err] = populatedTransaction

  const gasPriceRaw = transaction.gasPrice
  delete transaction["gasPrice"]

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const gasPrice = BigNumber.from(gasPriceRaw ?? transaction?.maxFeePerGas)
  const maxFeePerGas = BigNumber.from(transaction?.maxFeePerGas ?? gasPriceRaw)
  const price = BigNumber.from(transaction?.value ?? "0x0")

  const fee = gasLimit.mul(gasPrice).div(125).mul(100)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rate
  const maxFee = gasLimit.mul(maxFeePerGas)
  const maxFeeUsd = parseFloat(ethers.utils.formatEther(maxFee)) * rate
  const total = price.add(fee)
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rate
  const maxTotal = price.add(maxFee)
  const maxTotalUsd = parseFloat(ethers.utils.formatEther(maxTotal)) * rate

  return {
    fee: ethers.utils.formatEther(fee),
    feeUsd: feeUsd.toFixed(2),
    maxFee: ethers.utils.formatEther(maxFee),
    maxFeeUsd: maxFeeUsd.toFixed(2),
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    maxTotal: ethers.utils.formatEther(maxTotal),
    maxTotalUsd: maxTotalUsd.toFixed(2),
    price: ethers.utils.formatEther(price),
    isInsufficientFundsError: ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: ProviderError.NETWORK_BUSY === err,
  }
}
