import { TransactionRequest } from "@ethersproject/abstract-provider"
import { ethers } from "ethers"

import { EthWalletV2 } from "../../ecdsa-signer/signer-ecdsa"
import { getPrice } from "../asset"
import { EthEstimatedTransactionRequest } from "../types"
import { ethTransferRequest } from "./transferRequest/ethTransferRequest"
import { ntfErc721TransferRequest } from "./transferRequest/nftErc721TransferRequest"
import { ntfErc1155TransferRequest } from "./transferRequest/nftErc1155TransferRequest"

export type TransferRequest = {
  estimate: (
    from: string,
    wallet: EthWalletV2,
    request: EthEstimatedTransactionRequest,
  ) => Promise<object>
}

const transferRequests: { [key: string]: TransferRequest } = {
  EthTransferRequest: ethTransferRequest,
  NftErc721TransferRequest: ntfErc721TransferRequest,
  NftErc1155TransferRequest: ntfErc1155TransferRequest,
}

export async function estimateTransaction(
  wallet: EthWalletV2,
  request: EthEstimatedTransactionRequest,
) {
  const { to } = request
  const [from, nonce, { gasPrice, maxPriorityFeePerGas, maxFeePerGas }, rates] =
    await Promise.all([
      wallet.getAddress(),
      wallet.getTransactionCount("latest"),
      wallet.getFeeData(),
      getPrice(["ETH"]),
    ])

  if (!gasPrice || !maxPriorityFeePerGas || !maxFeePerGas) {
    throw Error("No FeeData received from Provider.")
  }

  const transferRequest = transferRequests[request.constructor.name]

  if (!transferRequest) {
    throw Error("No transfer request handler.")
  }

  const tx = await transferRequest.estimate(from, wallet, request)

  const transaction: TransactionRequest = {
    from,
    to,
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    ...tx,
  }

  transaction.gasLimit = await wallet.estimateGas(transaction)

  const ethPrice = parseFloat(rates[0].price)
  const fee = transaction.gasLimit.mul(gasPrice)
  const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * ethPrice
  const maxFee = transaction.gasLimit.mul(maxFeePerGas)
  const maxFeeUsd = parseFloat(ethers.utils.formatEther(maxFee)) * ethPrice

  return {
    transaction,
    fee: ethers.utils.formatEther(fee),
    feeUsd: feeUsd.toFixed(2),
    maxFee: ethers.utils.formatEther(maxFee),
    maxFeeUsd: maxFeeUsd.toFixed(2),
  }
}
