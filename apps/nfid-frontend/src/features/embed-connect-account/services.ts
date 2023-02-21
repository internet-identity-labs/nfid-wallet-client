// import { ethers } from "ethers"
import { ethers } from "ethers"

import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPC_BASE } from "../embed/rpc-service"

type ConnectAccountServiceContext = {
  authSession?: AuthSession
  rpcMessage?: RPCMessage
}

export const ConnectAccountService = async (
  { authSession, rpcMessage }: ConnectAccountServiceContext,
  event: {
    type: string
    data: { hostname: string; accountId: string }
  },
) => {
  console.log(event)
  if (!authSession || !rpcMessage)
    throw new Error("No authSession or rpcMessage")

  const identity = await getWalletDelegation(
    authSession.anchor,
    event.data.hostname,
    event.data.accountId,
  )
  replaceActorIdentity(ecdsaSigner, identity)

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)
  const address = await nfidWallet.getAddress()

  return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result: [address] })
}
