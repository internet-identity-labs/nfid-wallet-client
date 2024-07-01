import { ethers } from "ethers"

import { EthWalletV2 } from "../../ecdsa-signer/signer-ecdsa"
import { ErrorCode } from "../error-code.enum"
import { EstimateTransactionRequest, EstimatedTransaction } from "../types"
import { coinbaseRatesService } from "./coinbase-rates.service"
import { erc20PopulateTransactionService } from "./populate-transaction-service/erc20-populate-transaction.service"
import { ethPopulateTransactionService } from "./populate-transaction-service/eth-populate-transaction.service"
import { ntfErc721PopulateTransactionService } from "./populate-transaction-service/nft-erc721-populate-transaction.service"
import { ntfErc1155PopulateTransactionService } from "./populate-transaction-service/nft-erc1155-populate-transaction.service"

export type PopulateTransactionService = {
  populate: (
    from: string,
    wallet: EthWalletV2,
    request: EstimateTransactionRequest,
    feeData: ethers.providers.FeeData,
    nonce: number,
    chainId: number,
  ) => Promise<PopulateTransactionResponse>
}

export type PopulateTransactionResponse = {
  populatedTransaction: ethers.providers.TransactionRequest
  errors: ErrorCode[]
}

const populateTransactionServices: Record<string, PopulateTransactionService> =
  {
    Erc20EstimateTransactionRequest: erc20PopulateTransactionService,
    EthTransferRequest: ethPopulateTransactionService,
    NftErc721EstimateTransactionRequest: ntfErc721PopulateTransactionService,
    NftErc1155EstimateTransactionRequest: ntfErc1155PopulateTransactionService,
  }

export async function estimateTransaction(
  wallet: EthWalletV2,
  request: EstimateTransactionRequest,
): Promise<EstimatedTransaction> {
  const chainId = await wallet.getChainId()

  const [from, nonce, feeData, rate] = await Promise.all([
    wallet.getAddress(),
    wallet.getTransactionCount("latest"),
    wallet.getFeeData(),
    coinbaseRatesService.getRateByChainId(chainId),
  ])

  if (
    !feeData.gasPrice ||
    !feeData.maxPriorityFeePerGas ||
    !feeData.maxFeePerGas
  ) {
    throw Error("No FeeData received from Provider.")
  }

  const populateTransactionService = populateTransactionServices[request.type]

  if (!populateTransactionService) {
    throw Error("No populate transaction service found.")
  }

  const populateTransactionResponse = await populateTransactionService.populate(
    from,
    wallet,
    request,
    feeData,
    nonce,
    chainId,
  )

  const transaction = populateTransactionResponse.populatedTransaction

  if (!transaction.gasLimit) {
    throw Error("GasLimit wasn't calculated.")
  }

  const value = transaction.value
  const valueUsd = value
    ? parseFloat(ethers.utils.formatEther(value)) * rate!
    : undefined
  const fee = feeData.gasPrice.mul(transaction.gasLimit)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * rate!
  const maxFee = feeData.maxFeePerGas.mul(transaction.gasLimit)
  const maxFeeUsd = parseFloat(ethers.utils.formatEther(maxFee)) * rate!
  const total = value ? fee.add(value) : fee
  const totalUsd = parseFloat(ethers.utils.formatEther(total)) * rate!

  return {
    transaction,
    fee: ethers.utils.formatEther(fee),
    feeUsd: feeUsd.toFixed(2),
    maxFee: ethers.utils.formatEther(maxFee),
    maxFeeUsd: maxFeeUsd.toFixed(2),
    value: value ? ethers.utils.formatEther(value) : undefined,
    valueUsd: valueUsd ? valueUsd.toFixed(2) : undefined,
    total: ethers.utils.formatEther(total),
    totalUsd: totalUsd.toFixed(2),
    errors: populateTransactionResponse.errors,
  }
}
