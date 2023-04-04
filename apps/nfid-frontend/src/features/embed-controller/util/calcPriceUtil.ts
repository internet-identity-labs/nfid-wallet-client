import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPrice(
  populatedTransaction: TransactionRequest | Error | undefined,
  rates: IRate,
) {
  if (!rates["ETH"] || !populatedTransaction)
    return {
      fee: "0",
      feeUsd: "0",
      total: "0",
      totalUsd: "0",
      price: "0",
    }

  if (populatedTransaction instanceof Error) {
    return {
      fee: "N/A",
      feeUsd: "N/A",
      total:
        (populatedTransaction as any).reason || populatedTransaction.message,
      totalUsd: "N/A",
      price: "N/A",
    }
  }

  const gasLimit = BigNumber.from(populatedTransaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(populatedTransaction?.maxFeePerGas)
  const price = BigNumber.from(populatedTransaction?.value)
  const fee = gasLimit.mul(maxFeePerGas)
  const total = price.add(fee)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rates["ETH"]

  return {
    feeUsd: feeUsd.toFixed(2),
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    price: ethers.utils.formatEther(price),
  }
}
