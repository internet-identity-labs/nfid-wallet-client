import { DelegationIdentity } from "@dfinity/identity"
import { BigNumber, ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { ErrorCode } from "../../error-code.enum"
import { PopulateTransactionService } from "../../service/estimate-transaction.service"
import { EstimateTransactionRequest } from "../../types"

export class NftErc1155EstimateTransactionRequest
  implements EstimateTransactionRequest
{
  readonly type = "NftErc1155EstimateTransactionRequest"
  constructor(
    readonly identity: DelegationIdentity,
    readonly to: string,
    readonly amount: number,
    readonly contractId: string,
    readonly tokenId: string,
  ) {}
}

const ABI = [
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
]

export const ntfErc1155PopulateTransactionService: PopulateTransactionService =
  {
    populate: async (
      from: string,
      wallet: EthWalletV2,
      request: EstimateTransactionRequest,
      { maxFeePerGas, maxPriorityFeePerGas }: ethers.providers.FeeData,
      nonce: number,
      chainId: number,
    ) => {
      const errors: ErrorCode[] = []
      const { to, amount, contractId, tokenId } =
        request as NftErc1155EstimateTransactionRequest
      const contract = new ethers.Contract(
        contractId,
        ABI,
        wallet.provider,
      ).connect(wallet)

      const data = contract.interface.encodeFunctionData("safeTransferFrom", [
        from,
        to,
        tokenId,
        amount,
        "0x00",
      ])

      const tx: ethers.providers.TransactionRequest = {
        to: contractId,
        from,
        nonce,
        maxFeePerGas: maxFeePerGas || undefined,
        maxPriorityFeePerGas: maxPriorityFeePerGas || undefined,
        data,
      }

      try {
        const populatedTransaction = await wallet.populateTransaction(tx)
        return { populatedTransaction, errors }
      } catch (error) {
        errors.push(ErrorCode.INSUFFICIENT_FUNDS)
        const populatedTransaction = { ...tx, gasLimit: BigNumber.from("0") }
        return { populatedTransaction, errors }
      }
    },
  }
