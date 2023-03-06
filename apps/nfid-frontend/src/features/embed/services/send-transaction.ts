import { nfidEthWallet } from "@nfid/integration"

import { CheckoutMachineContext } from "frontend/features/checkout/machine"

import { RPCMessage, RPCResponse, RPC_BASE } from "../rpc-service"

export const sendTransactionService = async (
  { preparedSignature, rpcMessage }: CheckoutMachineContext,
  event: { type: string; data?: RPCMessage },
): Promise<RPCResponse> => {
  console.debug("sendTransactionService", { preparedSignature })
  if (!event.data) throw new Error("No event data")
  if (!rpcMessage) throw new Error("No rpcMessage")
  if (
    !preparedSignature?.hash ||
    !preparedSignature?.message ||
    !preparedSignature?.tx
  )
    throw new Error("No prepared signature")

  return new Promise(async (resolve) => {
    try {
      console.time("SendTransactionService sendTransaction:")
      const { wait, ...result } = await nfidEthWallet.sendPreparedTransaction(
        preparedSignature?.hash,
        preparedSignature?.message,
        preparedSignature?.tx,
      )
      console.timeEnd("SendTransactionService sendTransaction:")
      console.debug("SendTransactionService", { result })
      return resolve({
        ...RPC_BASE,
        id: rpcMessage.id,
        result: result.hash,
      })
    } catch (e) {
      console.error("SendTransactionService", { e })
      return resolve({
        ...RPC_BASE,
        id: rpcMessage.id,
        // FIXME:
        // define which errors could happen
        error: { code: -1, message: (e as any).message, data: e },
      })
    }
  })
}
