// import { ethers } from "ethers"
import { ethers } from "ethers"

import { readAddress, createAddress } from "@nfid/client-db"
import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPC_BASE } from "../embed/rpc-service"

type ConnectAccountServiceContext = {
  authSession?: AuthSession
  rpcMessage?: RPCMessage
}

type GetAddressArgs = {
  anchor: number
  hostname: string
  accountId: string
}

const getAddress = async ({ anchor, hostname, accountId }: GetAddressArgs) => {
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
  { authSession, rpcMessage }: ConnectAccountServiceContext,
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
    : await getAddress({ anchor: authSession.anchor, ...event.data })

  !cachedAddress && createAddress({ ...event.data, address })

  return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result: [address] })
}
