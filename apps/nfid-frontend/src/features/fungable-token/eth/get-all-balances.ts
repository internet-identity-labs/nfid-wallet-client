import { ethereumAsset } from "@nfid/integration"

import { getAllEthAddresses } from "./get-all-addresses"
import { getEthBalance } from "./get-eth-balance"

export const getAllEthBalances = async () => {
  const addresses = await getAllEthAddresses()
  const exchangeRate =
    await ethereumAsset.raribleSdk.apis.currency.getCurrencyUsdRateByCurrencyId(
      {
        currencyId: "ETHEREUM:0x0000000000000000000000000000000000000000",
        at: new Date(),
      },
    )

  const balances = await Promise.all(
    addresses.map(async (address) => {
      const balance = await getEthBalance({ ethAddress: address })
      return {
        [address]: {
          eth: balance,
          usd: Number(balance) * Number(exchangeRate.rate.toString()),
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
