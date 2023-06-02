import { format } from "date-fns"
import { TransactionRow } from "packages/integration/src/lib/asset/types"

import {
  ethereumGoerliAsset,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export const getEthTransactions = async () => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())

  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )
  const address = await ethereumGoerliAsset.getAddress(delegation)
  const incoming = await ethereumGoerliAsset.getFungibleActivityByTokenAndUser(
    {
      direction: "to",
    },
    delegation,
  )

  const outcoming = await ethereumGoerliAsset.getFungibleActivityByTokenAndUser(
    {
      direction: "from",
    },
    delegation,
  )

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
}
