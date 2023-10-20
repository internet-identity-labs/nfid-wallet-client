import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { Chain, getPublicKey } from "packages/integration/src/lib/lambda/ecdsa"

import { authState, getBalance } from "@nfid/integration"

import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

export const getPublicProfile = async (): Promise<{
  balance: string
  balanceUSD: string
}> => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) throw new Error("No identity")

  const publicKey = await getPublicKey(delegationIdentity!, Chain.IC)
  const publicDelegation = Ed25519KeyIdentity.fromParsedJson([publicKey, ""])
  const principal = Principal.selfAuthenticating(
    new Uint8Array(publicDelegation.getPublicKey().toDer()),
  )

  const address = principalToAddress(principal as any)
  const balance = e8sICPToString(Number(await getBalance(address)))
  const exchangeRate = await getExchangeRate()

  return {
    balance: balance,
    balanceUSD:
      balance === "0" ? "0" : `$${(exchangeRate * Number(balance)).toFixed(2)}`,
  }
}
