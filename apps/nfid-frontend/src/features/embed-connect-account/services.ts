// import { ethers } from "ethers"
import { ethers } from "ethers"

import { readAddress, createAddress, createConnection } from "@nfid/client-db"
import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { RPC_BASE } from "../embed/rpc-service"
import { EmbedConnectAccountMachineContext } from "./machines"

type GetAddressArgs = {
  anchor: number
  hostname: string
  accountId: string
}

const getEthAddress = async ({
  anchor,
  hostname,
  accountId,
}: GetAddressArgs) => {
  console.debug("getAddress")
  const identity = await getWalletDelegation(anchor, hostname, accountId)
  replaceActorIdentity(ecdsaSigner, identity)

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)
  return nfidWallet.getAddress()
}

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
