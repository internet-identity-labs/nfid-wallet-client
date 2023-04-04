import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPriceDeployCollection(
  populatedTransaction: TransactionRequest | Error | undefined,
  rates: IRate,
) {
  if (!rates["ETH"] || !populatedTransaction)
    return {
      fee: "0",
      feeUsd: "0",
    }

  if (populatedTransaction instanceof Error) {
    return {
      fee: (populatedTransaction as any).reason || populatedTransaction.message,
      feeUsd: "N/A",
    }
  }

  const gasLimit = BigNumber.from(populatedTransaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(populatedTransaction?.maxFeePerGas)
  const fee = gasLimit.mul(maxFeePerGas)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]

  return {
    feeUsd: feeUsd.toFixed(2),
    fee: ethers.utils.formatEther(fee),
  }
}
