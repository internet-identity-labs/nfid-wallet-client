import {
  Balance,
  RosettaBalance,
  TransactionHistory,
  XdrUsd,
} from "./rosetta_interface"
import { camelizeKeys } from "./util"

export async function mapToXdrUsd(response: Response): Promise<XdrUsd> {
  return response.json().then((data) => data as XdrUsd)
}

export async function mapToTransactionHistory(
  response: Response,
): Promise<TransactionHistory> {
  return await response
    .json()
    .then((data) => camelizeKeys(data) as TransactionHistory)
}

export async function mapToBalance(response: Response): Promise<Balance> {
  return await response
    .json()
    .then((data) => data as RosettaBalance)
    .then((balance: RosettaBalance) => balance.balances[0])
}
