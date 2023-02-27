import { EthWallet } from "@nfid/integration"

import { CheckoutMachineContext } from "./machine"

export const postLoaderService = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {}, 1000)
  })
}

export const prepareSignature = async ({
  rpcMessage,
}: CheckoutMachineContext) => {
  const nfidWallet = new EthWallet()

  const rawMessage = rpcMessage?.params[0]
  const message = Object.keys(rawMessage).reduce(
    (acc, key) => ({
      ...acc,
      ...(rawMessage[key] ? { [key]: rawMessage[key] } : {}),
    }),
    {},
  )

  return nfidWallet.prepareSendTransaction(message)
}
