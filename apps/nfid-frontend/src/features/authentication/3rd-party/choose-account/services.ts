import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { authState, getBalance, getPublicKey } from "@nfid/integration"

import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

export const getPublicProfile = async (): Promise<{
  balance: string
  balanceUSD: string
  address: string
  principal: Principal
}> => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) throw new Error("No identity")

  const principalString = await getPublicKey(delegationIdentity)
  const principal = Principal.fromText(principalString)
  const address = AccountIdentifier.fromPrincipal({ principal }).toHex()
  const balance = e8sICPToString(Number(await getBalance(address)))
  const exchangeRate = await getExchangeRate("ICP")

  return {
    balance,
    balanceUSD:
      balance === "0"
        ? "0.00 USD"
        : `${(exchangeRate * Number(balance)).toFixed(2)} USD`,
    address,
    principal,
  }
}
