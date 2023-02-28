import { createConnection } from "@nfid/client-db"
import { ecdsaSigner, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { RPC_BASE } from "../embed/rpc-service"
import { getEthAddress } from "../fungable-token/eth/get-eth-address"
import { EmbedConnectAccountMachineContext } from "./machines"

export const ConnectAccountService = async (
  { authSession, rpcMessage, authRequest }: EmbedConnectAccountMachineContext,
  event: {
    type: string
    data: { hostname: string; accountId: string }
  },
) => {
  if (!authSession || !rpcMessage)
    throw new Error("No authSession or rpcMessage")

  const address = await getEthAddress({
    anchor: authSession.anchor,
    ...event.data,
  })

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
