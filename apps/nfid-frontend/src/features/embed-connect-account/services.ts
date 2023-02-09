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

export const ConnectAccountService = async ({
  authSession,
  rpcMessage,
}: ConnectAccountServiceContext) => {
  if (!authSession || !rpcMessage)
    throw new Error("No authSession or rpcMessage")
  console.time("ConnectAccountService")
  console.time("ConnectAccountService getWalletDelegation")
  const identity = await getWalletDelegation(authSession.anchor)
  replaceActorIdentity(ecdsaSigner, identity)
  console.timeEnd("ConnectAccountService getWalletDelegation")

  console.time("ConnectAccountService getAddress")
  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)
  const address = await nfidWallet.getAddress()
  console.timeEnd("ConnectAccountService getAddress")

  console.debug("ConnectAccountService")
  console.timeEnd("ConnectAccountService")
  return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result: [address] })
}
