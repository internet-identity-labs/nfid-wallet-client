import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { NftErc1155TransferRequest } from "../../asset-ethereum"
import { EthEstimatedTransactionRequest } from "../../types"
import { TransferRequest } from "../estimateTransaction"

const ABI = [
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
]

export const ntfErc1155TransferRequest: TransferRequest = {
  estimate: async (
    from: string,
    wallet: EthWalletV2,
    request: EthEstimatedTransactionRequest,
  ) => {
    const { to, amount, contractId, tokenId } =
      request as NftErc1155TransferRequest
    const contract = new ethers.Contract(
      contractId,
      ABI,
      wallet.provider,
    ).connect(wallet)

    const populateTransaction = await contract.populateTransaction[
      "safeTransferFrom"
    ](from, to, tokenId, amount, "0x00")

    return populateTransaction
  },
}
