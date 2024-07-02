import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { Chain, getPublicKey } from "packages/integration/src/lib/lambda/ecdsa"

import { authState, getBalance } from "@nfid/integration"

import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

export const getPublicProfile = async (): Promise<{
  balance: string
  balanceUSD: string
  address: string
  principal: string
}> => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) throw new Error("No identity")

  const principal = await getPublicKey(delegationIdentity!, Chain.IC)

  const address = principalToAddress(Principal.fromText(principal) as any)
  const balance = e8sICPToString(Number(await getBalance(address)))
  const exchangeRate = await getExchangeRate("ICP")

  return {
    balance: balance,
    balanceUSD:
      balance === "0"
        ? "0.00 USD"
        : `${(exchangeRate * Number(balance)).toFixed(2)} USD`,
    address,
    principal: principal.toText(),
  }
}
