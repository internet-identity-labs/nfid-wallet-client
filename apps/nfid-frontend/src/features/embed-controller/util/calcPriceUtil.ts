import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { ProviderError } from "@nfid/integration"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPrice(
  rates: IRate,
  populatedTransaction?: [TransactionRequest, ProviderError | undefined],
) {
  if (!rates["ETH"] || !populatedTransaction || !populatedTransaction[0])
    return {
      fee: "0",
      feeUsd: "0",
      total: "0",
      totalUsd: "0",
      price: "0",
    }

  const [transaction, err] = populatedTransaction

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(
    transaction?.maxFeePerGas ?? transaction?.gasPrice,
  )
  const price = BigNumber.from(transaction?.value)
  const fee = gasLimit.mul(maxFeePerGas)
  const total = price.add(fee)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rates["ETH"]

  console.log("COMPARISON", {
    isInsufficientFundsError: ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: ProviderError.NETWORK_BUSY === err,
  })

  return {
    feeUsd: feeUsd.toFixed(2),
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    price: ethers.utils.formatEther(price),
    isInsufficientFundsError: ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: ProviderError.NETWORK_BUSY === err,
  }
}
