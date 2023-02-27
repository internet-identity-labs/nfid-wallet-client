import { nfidEthWallet } from "@nfid/integration"

import { CheckoutMachineContext } from "frontend/features/checkout/machine"

import { RPCMessage, RPC_BASE } from "../rpc-service"

export const sendTransactionService = async (
  { preparedSignature }: CheckoutMachineContext,
  event: { type: string; data?: RPCMessage },
) => {
  if (!event.data) throw new Error("No event data")
  if (
    !preparedSignature?.hash ||
    !preparedSignature?.message ||
    !preparedSignature?.tx
  )
    throw new Error("No prepared signature")

  try {
    console.time("SendTransactionService sendTransaction:")
    const { wait, ...result } = await nfidEthWallet.sendPreparedTransaction(
      preparedSignature?.hash,
      preparedSignature?.message,
      preparedSignature?.tx,
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
