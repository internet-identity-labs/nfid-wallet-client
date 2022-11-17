import { Balance, RosettaBalance } from "."

export async function mapToBalance(response: Response): Promise<Balance> {
  return await response
    .json()
    .then((data) => data as RosettaBalance)
    .then((balance: RosettaBalance) => {
      return {
        ...balance.balances[0],
        value: (Number(balance.balances[0].value) / 10 ** 8).toString(),
      }
    })
}
