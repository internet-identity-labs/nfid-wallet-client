import { TransactionRequest } from "@ethersproject/abstract-provider"
import { debug } from "console"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPriceDeployCollection(
  rates: IRate,
  populatedTransaction?: [TransactionRequest, Error | undefined],
) {
  let error

  if (!rates["ETH"] || !populatedTransaction || !populatedTransaction[0])
    return {
      fee: "0",
      feeUsd: "0",
    }

  const [transaction, err] = populatedTransaction

  if (err) {
    error = {
      message: (err as any).reason || err.message,
    }
  }

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(transaction?.maxFeePerGas)
  const fee = gasLimit.mul(maxFeePerGas)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]

  return {
    feeUsd: feeUsd.toFixed(2),
    fee: ethers.utils.formatEther(fee),
    error,
  }
}
