import { Balance, RosettaBalance } from "."

export async function mapToBalance(response: Response): Promise<Balance> {
  return await response
    .json()
    .then((data) => data as RosettaBalance)
    .then((balance: RosettaBalance) => {
      return BigInt(Math.floor(Number(balance.balances[0].value)))
    })
}
