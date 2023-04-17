import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { NftErc721TransferRequest } from "../../asset-ethereum"
import { EthEstimatedTransactionRequest } from "../../types"
import { TransferRequest } from "../estimateTransaction"

const ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
]

export const ntfErc721TransferRequest: TransferRequest = {
  estimate: async (
    from: string,
    wallet: EthWalletV2,
    request: EthEstimatedTransactionRequest,
  ) => {
    const { to, contractId, tokenId } = request as NftErc721TransferRequest
    const contract = new ethers.Contract(
      contractId,
      ABI,
      wallet.provider,
    ).connect(wallet)

    const populateTransaction = await contract.populateTransaction[
      "safeTransferFrom"
    ](from, to, tokenId)

    return populateTransaction
  },
}
