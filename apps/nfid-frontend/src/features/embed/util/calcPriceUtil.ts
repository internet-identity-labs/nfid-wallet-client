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
      feeUsd: "0",
      total: "0",
      totalUsd: "0",
      price: "0",
      isInsufficientFundsError: false,
      isNetworkIsBusyWarning: false,
    }

  const [transaction, err] = populatedTransaction

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(
    transaction?.maxFeePerGas ?? transaction?.gasPrice,
  )
  const price = BigNumber.from(transaction?.value ?? "0x0")
  const fee = gasLimit.mul(maxFeePerGas)
  const total = price.add(fee)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rates["ETH"]

  return {
    fee: String(Number(fee) / 10 ** 18),
    feeUsd: feeUsd.toFixed(2),
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    price: ethers.utils.formatEther(price),
    isInsufficientFundsError: ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: ProviderError.NETWORK_BUSY === err,
  }
}
