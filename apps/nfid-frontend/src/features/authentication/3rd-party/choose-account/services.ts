import { principalToAddress } from "ictool"
import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"

import { truncateString } from "@nfid-frontend/utils"
import { authState, getBalance } from "@nfid/integration"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

export const getPublicProfile = async (): Promise<{
  label: string
  address: string
  balance: string
  balanceUSD: string
}> => {
  const { delegationIdentity } = (await authState).get()
  if (!delegationIdentity) throw new Error("No identity")

  const publicDelegation = await getGlobalKeys(delegationIdentity, Chain.IC, [
    "nux62-yqaaa-aaaak-ae2pq-cai",
  ])

  const principal = publicDelegation.getPrincipal()
  const address = principalToAddress(principal)
  const balance = e8sICPToString(Number(await getBalance(address)))
  const exchangeRate = await getExchangeRate()

  return {
    label: "NFID",
    address: truncateString(principal.toText(), 6, 4),
    balance: balance,
    balanceUSD: toUSD(Number(balance), exchangeRate),
  }
}
