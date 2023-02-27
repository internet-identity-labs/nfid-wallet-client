import { ethers } from "ethers"

import { ecdsaSigner, EthWallet, replaceActorIdentity } from "@nfid/integration"

import { CheckoutMachineContext } from "frontend/features/checkout/machine"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { RPCMessage, RPC_BASE } from "../rpc-service"

export const sendTransactionService = async (
  { signatureId }: CheckoutMachineContext,
  event: { type: string; data?: RPCMessage },
) => {
  if (!event.data) throw new Error("No event data")
  // const identity = await getWalletDelegation(authSession.anchor)
  // replaceActorIdentity(ecdsaSigner, identity)

  // const rawMessage = event.data.params[0]
  // const message = Object.keys(rawMessage).reduce(
  //   (acc, key) => ({
  //     ...acc,
  //     ...(rawMessage[key] ? { [key]: rawMessage[key] } : {}),
  //   }),
  //   {},
  // )

  // console.debug("SendTransactionService", { message: rawMessage, req: message })

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)

  try {
    console.time("SendTransactionService sendTransaction:")
    const { wait, ...result } = await nfidWallet.getPreparedSignature(
      signatureId,
    )
    console.timeEnd("SendTransactionService sendTransaction:")
    console.debug("SendTransactionService", { result })
    return Promise.resolve({
      ...RPC_BASE,
      id: event.data.id,
      result: result.hash,
    })
  } catch (e) {
    console.error("SendTransactionService", { e })
    return Promise.resolve({ ...RPC_BASE, id: event.data.id, error: e })
  }
}
