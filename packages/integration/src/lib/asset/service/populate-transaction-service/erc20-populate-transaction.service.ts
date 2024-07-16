import { DelegationIdentity } from "@dfinity/identity"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import { ErrorCode } from "../../error-code.enum"
import { PopulateTransactionService } from "../../service/estimate-transaction.service"
import { EstimateTransactionRequest } from "../../types"
import { alchemyService } from "../alchemy.service"

export class Erc20EstimateTransactionRequest
  implements EstimateTransactionRequest
{
  readonly type = "Erc20EstimateTransactionRequest"
  constructor(
    readonly identity: DelegationIdentity,
    readonly to: string,
    readonly contractId: string,
    readonly amount: number,
  ) {}
}

const ABI = [
  "function transfer(address _to, uint256 _value)",
  "function balanceOf(address) view returns (uint256)",
]

export const erc20PopulateTransactionService: PopulateTransactionService = {
  populate: async (
    from: string,
    wallet: EthWalletV2,
    request: EstimateTransactionRequest,
    { maxFeePerGas, maxPriorityFeePerGas }: ethers.providers.FeeData,
    nonce: number,
    chainId: number,
  ) => {
    const errors: ErrorCode[] = []
    const { to, contractId, amount } =
      request as Erc20EstimateTransactionRequest
    const quantity = amount ? amount : 0
    const receiver = to ? to : from
    const contract = new ethers.Contract(
      contractId,
      ABI,
      wallet.provider,
    ).connect(wallet)

    const balanceOf = await contract["balanceOf"](from)
    const balance = Number(ethers.utils.formatEther(balanceOf))
    let data

    if (Number(balance) < quantity) {
      errors.push(ErrorCode.INSUFFICIENT_FUNDS_CONTRACT)
      data = contract.interface.encodeFunctionData("transfer", [
        receiver,
        ethers.utils.parseUnits("0", 18),
      ])
    } else {
      data = contract.interface.encodeFunctionData("transfer", [
        receiver,
        ethers.utils.parseUnits(quantity.toString(), 18),
      ])
    }

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

      const tempTx = { ...tx }
      delete tempTx["from"]
      const gasLimit = await alchemyService.estimateGas(chainId, tempTx)
      const populatedTransaction = { ...tx, gasLimit }

      return { populatedTransaction, errors }
    }
  },
}
