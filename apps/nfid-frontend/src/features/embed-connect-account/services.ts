import { readAddress, createAddress, createConnection } from "@nfid/client-db"

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
  console.log(event)
  const cachedAddress = readAddress({
    accountId: event.data.accountId,
    hostname: event.data.hostname,
  })

  if (!authSession || !rpcMessage)
    throw new Error("No authSession or rpcMessage")

  const address = cachedAddress
    ? cachedAddress
    : await getEthAddress({ anchor: authSession.anchor, ...event.data })

  !cachedAddress && createAddress({ ...event.data, address })

  createConnection({
    connectionDomain: authRequest.derivationOrigin ?? authRequest.hostname,
    accountId: event.data.accountId,
    domain: event.data.hostname,
  })

  return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result: [address] })
}
