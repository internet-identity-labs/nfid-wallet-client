import { createConnection } from "@nfid/client-db"
import { ecdsaSigner, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizationRequest } from "frontend/state/authorization"

import { RPCMessage, RPC_BASE } from "../embed/services/rpc-receiver"
import { getEthAddress } from "../fungable-token/eth/get-eth-address"

type ConnectAccountServiceArgs = {
  authSession: AuthSession
  rpcMessage: RPCMessage
  authRequest: AuthorizationRequest
}

export const ConnectAccountService = async (
  { authSession, rpcMessage, authRequest }: ConnectAccountServiceArgs,
  event: {
    type: string
    data: { hostname: string; accountId: string }
  },
) => {
  console.debug("ConnectAccountService", event)
  if (!authSession || !rpcMessage)
    throw new Error("No authSession or rpcMessage")

  const address = await getEthAddress({
    anchor: authSession.anchor,
    ...event.data,
  })
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

  return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result: [address] })
}
