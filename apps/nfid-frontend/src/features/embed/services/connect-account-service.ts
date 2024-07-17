import { createConnection } from "@nfid/client-db"
import { ecdsaSigner, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizationRequest } from "frontend/state/authorization"

import { getEthAddress } from "../../fungible-token/eth/get-eth-address"

export type ConnectAccountServiceContext = {
  authSession?: AuthSession
  authRequest?: AuthorizationRequest
}

export const ConnectAccountService = async (
  { authSession, authRequest }: ConnectAccountServiceContext,
  event: {
    data: { hostname: string; accountId: string }
  },
) => {
  console.debug("ConnectAccountService", event)
  if (!authSession)
    throw new Error("ConnectAccountService: missing authSession")
  if (!authRequest)
    throw new Error("ConnectAccountService: missing authRequest")

  const address = await getEthAddress(authSession.anchor)
  console.debug("ConnectAccountService", { address })

  const identity = await getWalletDelegation(
    authSession.anchor,
    event.data.hostname,
    event.data.accountId,
  )
  replaceActorIdentity(ecdsaSigner, identity)

  createConnection({
    connectionDomain: authRequest.derivationOrigin ?? authRequest.hostname,
    accountId: event.data.accountId,
    domain: event.data.hostname,
  })

  return [address]
}
