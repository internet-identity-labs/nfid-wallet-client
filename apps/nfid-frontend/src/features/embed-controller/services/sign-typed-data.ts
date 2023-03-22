import {
  ecdsaSigner,
  nfidEthWallet,
  replaceActorIdentity,
} from "@nfid/integration"

import {
  RPCResponse,
  RPC_BASE,
} from "frontend/features/embed/services/rpc-receiver"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { EmbedControllerContext } from "../machine"

export const SignTypedDataService = async ({
  authSession,
  rpcMessage,
}: EmbedControllerContext): Promise<RPCResponse> => {
  console.log({ rpcMessage })
  if (!rpcMessage) throw new Error("No event data")
  const identity = await getWalletDelegation(authSession.anchor)
  replaceActorIdentity(ecdsaSigner, identity)

  const message = rpcMessage.params[1]
  const parsedMessage = JSON.parse(message)

  console.debug("SignTypedDataService", { parsedMessage })

  return new Promise(async (resolve) => {
    try {
      const result = await nfidEthWallet.signTypedData(parsedMessage)
      console.debug("SignTypedDataService", { result })
      return resolve({ ...RPC_BASE, id: rpcMessage.id, result })
    } catch (e: any) {
      console.error("SignTypedDataService", { e })
      return resolve({
        ...RPC_BASE,
        id: rpcMessage.id,
        // FIXME:
        // define which errors could happen
        error: { code: -1, message: e.message, data: e },
      })
    }
  })
}
