import { DelegationIdentity } from "@dfinity/identity"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../../../ecdsa-signer/signer-ecdsa"
import {
  EstimatedTransactionRequest,
  EthEstimatedTransactionRequest,
} from "../../types"
import { TransferRequest } from "../estimateTransaction"

export class Erc20TransferRequest implements EstimatedTransactionRequest {
  constructor(
    readonly identity: DelegationIdentity,
    readonly to: string,
    readonly contractId: string,
    readonly amount: number,
  ) {}
}

const ABI = ["function transfer(address _to, uint256 _value)"]

export const erc20TransferRequest: TransferRequest = {
  estimate: async (
    from: string,
    wallet: EthWalletV2,
    request: EthEstimatedTransactionRequest,
  ) => {
    const { to, contractId, amount } = request as Erc20TransferRequest
    const contract = new ethers.Contract(
      contractId,
      ABI,
      wallet.provider,
    ).connect(wallet)

    const populateTransaction = await contract.populateTransaction["transfer"](
      to,
      ethers.utils.parseUnits(amount.toString(), 18),
    )

    return populateTransaction
  },
}
