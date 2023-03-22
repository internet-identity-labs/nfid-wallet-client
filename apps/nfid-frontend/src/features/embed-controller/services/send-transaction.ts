import { nfidEthWallet } from "@nfid/integration"

import {
  RPCResponse,
  RPC_BASE,
} from "frontend/features/embed/services/rpc-receiver"

import { EmbedControllerContext } from "../machine"

export const sendTransactionService = async ({
  preparedSignature,
  rpcMessage,
}: EmbedControllerContext): Promise<RPCResponse> => {
  console.debug("sendTransactionService", { preparedSignature })
  if (!rpcMessage) throw new Error("No rpcMessage")
  if (
    !preparedSignature?.hash ||
    !preparedSignature?.message ||
    !preparedSignature?.tx
  )
    throw new Error("No prepared signature")

  console.time("SendTransactionService sendTransaction:")
  const { wait, ...result } = await nfidEthWallet.sendPreparedTransaction(
    preparedSignature?.hash,
    preparedSignature?.message,
    preparedSignature?.tx,
  )
  console.timeEnd("SendTransactionService sendTransaction:")
  console.debug("SendTransactionService", { result })
  return {
    ...RPC_BASE,
    id: rpcMessage.id,
    result: result.hash,
  }
}
