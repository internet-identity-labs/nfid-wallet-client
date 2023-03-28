import { format } from "date-fns"

import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { TransactionRow } from "frontend/integration/rosetta/select-transactions"

import { getEthAddress } from "./get-eth-address"

const ROOT_DOMAIN = "nfid.one"
const ETH_ROOT_ACCOUNT = "account 1"

export const getEthTransactions = async () => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const address = await getEthAddress({
    anchor: profile.anchor,
    accountId: ETH_ROOT_ACCOUNT,
    hostname: ROOT_DOMAIN,
  })

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
}
