import { nfidEthWallet } from "@nfid/integration"

import { EmbedControllerContext } from "../machine"

export const prepareSignature = async ({
  rpcMessage,
}: EmbedControllerContext) => {
  console.debug("prepareSignatureService", { rpcMessage })
  const rawMessage = rpcMessage?.params[0]
  const message = Object.keys(rawMessage).reduce(
    (acc, key) => ({
      ...acc,
      ...(rawMessage[key] ? { [key]: rawMessage[key] } : {}),
    }),
    {},
  )
  console.debug("prepareSignatureService", { message })
  const response = await nfidEthWallet.prepareSendTransaction(message)
  console.debug("prepareSignatureService", { response })

  return response
}
