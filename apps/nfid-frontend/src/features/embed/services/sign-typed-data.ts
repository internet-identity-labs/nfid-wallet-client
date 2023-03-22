import {
  ecdsaSigner,
  nfidEthWallet,
  replaceActorIdentity,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { EmbedControllerContext } from "../../embed-controller/machine"

export const SignTypedDataService = async ({
  authSession,
  rpcMessage,
}: EmbedControllerContext): Promise<string> => {
  console.log({ rpcMessage })
  if (!rpcMessage) throw new Error("No event data")
  // TODO: this needs to be handled by the auth service
  // this service has to expect the correct actor is ready
  const identity = await getWalletDelegation(authSession.anchor)
  replaceActorIdentity(ecdsaSigner, identity)

  const message = rpcMessage.params[1]
  const parsedMessage = JSON.parse(message)

  console.debug("SignTypedDataService", { parsedMessage })
  const result = await nfidEthWallet.signTypedData(parsedMessage)
  console.debug("SignTypedDataService", { result })
  return result
}
