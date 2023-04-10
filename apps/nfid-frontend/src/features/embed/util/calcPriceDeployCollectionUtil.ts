import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"
import { BigNumber } from "ethers/lib/ethers"

import { ProviderError } from "@nfid/integration"

import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

export function calcPriceDeployCollection(
  rates: IRate,
  populatedTransaction?: [TransactionRequest, ProviderError | undefined],
) {
  if (!rates["ETH"] || !populatedTransaction || !populatedTransaction[0])
    return {
      fee: "0",
      feeUsd: "0",
      isInsufficientFundsError: false,
      isNetworkIsBusyWarning: false,
    }
  const [transaction, err] = populatedTransaction

  const gasLimit = BigNumber.from(transaction?.gasLimit)
  const maxFeePerGas = BigNumber.from(
    transaction?.maxFeePerGas ?? transaction?.gasPrice,
  )
  const fee = gasLimit.mul(maxFeePerGas)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rates["ETH"]

  return {
    feeUsd: feeUsd.toFixed(2),
    fee: ethers.utils.formatEther(fee),
    isInsufficientFundsError: err ?? ProviderError.INSUFICIENT_FUNDS === err,
    isNetworkIsBusyWarning: err ?? ProviderError.NETWORK_BUSY === err,
  }
}
