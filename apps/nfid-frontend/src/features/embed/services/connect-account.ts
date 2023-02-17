// import { ethers } from "ethers"
import { RPCMessage, RPC_BASE } from "../rpc-service"
// import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"
import { AuthSession } from "frontend/state/authentication"
// import { getWalletDelegation } from "frontend/integration/facade/wallet"

type ConnectAccountServiceContext = {
  authSession: AuthSession
}

export const ConnectAccountService = async ({ authSession }: ConnectAccountServiceContext, event: { type: string, data: RPCMessage }) => {
  // console.time("ConnectAccountService")
  // console.time("ConnectAccountService getWalletDelegation")
  // const identity = await getWalletDelegation(authSession.anchor)
  // replaceActorIdentity(ecdsaSigner, identity)
  // console.timeEnd("ConnectAccountService getWalletDelegation")

  // console.time("ConnectAccountService getAddress")
  // const rpcProvider = new ethers.providers.JsonRpcProvider(
  //   "https://ethereum-goerli-rpc.allthatnode.com",
  // )
  // const nfidWallet = new EthWallet(rpcProvider)
  // const address = await nfidWallet.getAddress()
  // console.timeEnd("ConnectAccountService getAddress")

  // console.debug("ConnectAccountService")
  // console.timeEnd("ConnectAccountService")
  // return Promise.resolve({ ...RPC_BASE, id: event.data.id, result: [address] })
  return Promise.resolve({ ...RPC_BASE, id: event.data.id, result: ["0x5D88229726C01F00FDEFED1E70Bd628407Dc07cE"] })
}



