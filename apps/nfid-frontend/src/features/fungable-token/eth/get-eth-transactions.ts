import { format } from "date-fns"

import { ethereumAsset } from "@nfid/integration"

import { TransactionRow } from "frontend/integration/rosetta/select-transactions"

import { getAllEthAddresses } from "./get-all-addresses"

export const getEthTransactions = async () => {
  const adresses = await getAllEthAddresses()

  const txs = await Promise.all(
    adresses.map(async (address) => {
      const incoming = await ethereumAsset.getFungibleActivityByTokenAndUser({
        address: address,
        direction: "to",
      })

      const outcoming = await ethereumAsset.getFungibleActivityByTokenAndUser({
        address: address,
        direction: "from",
      })

      const allTXs = incoming.activities.concat(outcoming.activities)

      return (
        allTXs.map(
          (tx) =>
            ({
              type: tx.from === address.toLowerCase() ? "send" : "received",
              asset: "ETH",
              quantity: tx.price,
              date: format(new Date(tx.date), "MMM dd, yyyy - hh:mm:ss aaa"),
              from: tx.from,
              to: tx.to,
            } as TransactionRow),
        ) ?? []
      )
    }),
  )

  return txs.flat(1)
}
