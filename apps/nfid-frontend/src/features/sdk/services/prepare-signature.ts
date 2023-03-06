import { nfidEthWallet } from "@nfid/integration"

import { RPCControllerContext } from "../machine"

export const prepareSignature = async ({
  rpcMessage,
}: RPCControllerContext) => {
  console.debug("prepareSignature", { rpcMessage })
  const rawMessage = rpcMessage?.params[0]
  const message = Object.keys(rawMessage).reduce(
    (acc, key) => ({
      ...acc,
      ...(rawMessage[key] ? { [key]: rawMessage[key] } : {}),
    }),
    {},
  )
  console.debug("prepareSignature", { message })
  let response
  try {
    response = await nfidEthWallet.prepareSendTransaction(message)
  } catch (e) {
    console.log("prepareSignature Error", { e })
  }
  console.debug("prepareSignature", { response })

  return response
}
