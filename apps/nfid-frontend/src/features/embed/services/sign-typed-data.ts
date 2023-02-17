import { ethers } from "ethers"

import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { RPCMessage, RPC_BASE } from "../rpc-service"
import { AuthSession } from "frontend/state/authentication"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

type SignTypedDataServiceContext = {
  authSession: AuthSession
}


export const SignTypedDataService = async ({ authSession }: SignTypedDataServiceContext, event: { type: string; data: RPCMessage },
) => {
  const identity = await getWalletDelegation(authSession.anchor)
  replaceActorIdentity(ecdsaSigner, identity)

  const message = event.data.params[1]
  const parsedMessage = JSON.parse(message)

  console.debug("SignTypedDataService", { parsedMessage })

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)

  try {
    console.time("SignTypedDataService sendTransaction:")
    const result = await nfidWallet.signTypedData(parsedMessage)

    console.timeEnd("SignTypedDataService sendTransaction:")
    console.debug("SignTypedDataService", { result })
    return Promise.resolve({ ...RPC_BASE, id: event.data.id, result })
  } catch (e) {
    console.error("SignTypedDataService", { e })
    return Promise.resolve({ ...RPC_BASE, id: event.data.id, error: e })
  }
}
