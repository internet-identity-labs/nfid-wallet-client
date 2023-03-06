import { nfidEthWallet } from "@nfid/integration"
import { decode } from "@nfid/integration-ethereum"

import { CheckoutMachineContext } from "../machine"

export const prepareSignature = async ({
  rpcMessage,
}: CheckoutMachineContext) => {
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

  const response = await nfidEthWallet.prepareSendTransaction(message)
  console.debug("prepareSignature", { response })

  return response
}

export const decodeRequest = async ({ rpcMessage }: CheckoutMachineContext) => {
  const data = rpcMessage?.params[0].data
  return await decode(data)
}
