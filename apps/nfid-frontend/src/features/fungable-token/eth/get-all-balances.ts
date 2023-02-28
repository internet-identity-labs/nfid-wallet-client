import { ethereumAsset } from "@nfid/integration"

import { getAllEthAddresses } from "./get-all-addresses"

export const getAllEthBalances = async () => {
  const addresses = await getAllEthAddresses()

  const balances = await Promise.all(
    addresses.map(async (address) => {
      const balance = await ethereumAsset.getBalance(address)
      return {
        [address]: {
          eth: balance.balance?.toFixed(8) ?? "",
          usd: balance.balanceinUsd?.toNumber() ?? 0,
        },
      }
    }),
  )

  return balances.reduce(
    (acc, balance) => {
      const [address] = Object.keys(balance)
      const { eth, usd } = balance[address]
      acc.totalETH += parseFloat(eth)
      acc.totalUSD += usd
      acc.balances.push(balance)
      return acc
    },
    {
      totalETH: 0,
      totalUSD: 0,
      balances: [] as any,
    },
  )
}
