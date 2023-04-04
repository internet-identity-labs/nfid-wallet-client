import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPrice(
  rates: IRate,
  populatedTransaction?: [TransactionRequest, Error | undefined],
) {
  let error

  if (!rates["ETH"] || !populatedTransaction || !populatedTransaction[0])
    return {
      fee: "0",
      feeUsd: "0",
      total: "0",
      totalUsd: "0",
      price: "0",
    }

  const [transaction, err] = populatedTransaction

  debugger

  if (err) {
    error = {
      message: (err as any).reason || err.message,
    }
  }

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(
    transaction?.maxFeePerGas ?? transaction?.gasPrice,
  )
  const price = BigNumber.from(transaction?.value)
  const fee = gasLimit.mul(maxFeePerGas)
  const total = price.add(fee)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rates["ETH"]

  return {
    feeUsd: feeUsd.toFixed(2),
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    price: ethers.utils.formatEther(price),
    error,
  }
}
