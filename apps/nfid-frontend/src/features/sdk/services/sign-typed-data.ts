import { ethers } from "ethers"

import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { RPCResponse, RPC_BASE } from "frontend/features/embed/rpc-service"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { RPCControllerContext } from "../machine"

export const SignTypedDataService = async ({
  authSession,
  rpcMessage,
}: RPCControllerContext): Promise<RPCResponse> => {
  console.log({ rpcMessage })
  if (!rpcMessage) throw new Error("No event data")
  const identity = await getWalletDelegation(authSession.anchor)
  replaceActorIdentity(ecdsaSigner, identity)

  const message = rpcMessage.params[1]
  const parsedMessage = JSON.parse(message)

  console.debug("SignTypedDataService", { parsedMessage })

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)

  try {
    const result = await nfidWallet.signTypedData(parsedMessage)
    console.debug("SignTypedDataService", { result })
    return Promise.resolve({ ...RPC_BASE, id: rpcMessage.id, result })
  } catch (e: any) {
    console.error("SignTypedDataService", { e })
    return Promise.resolve({
      ...RPC_BASE,
      id: rpcMessage.id,
      // FIXME:
      // define which errors could happen
      error: { code: -1, message: e.message, data: e },
    })
  }
}
