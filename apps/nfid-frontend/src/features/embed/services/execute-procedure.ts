import { TransactionRequest } from "@ethersproject/abstract-provider"

import { DelegationWalletAdapter, ProviderError } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"

type CommonContext = { rpcMessage?: RPCMessage; authSession?: AuthSession }

export type ApproveSignatureEvent = {
  populatedTransaction?: [TransactionRequest, ProviderError | undefined]
}

type ExecuteProcedureEvent = ApproveSignatureEvent

type ExecuteProcedureServiceContext = CommonContext

export const ExecuteProcedureService = async (
  { rpcMessage, authSession }: ExecuteProcedureServiceContext,
  { data }: { data?: ExecuteProcedureEvent },
): Promise<RPCResponse> => {
  if (!rpcMessage)
    throw new Error("ExecuteProcedureService: missing rpcMessage")
  if (!authSession)
    throw new Error("ExecuteProcedureService: missing authSession")

  const rpcBase = { ...RPC_BASE, id: rpcMessage.id }
  const delegation = await getWalletDelegation(authSession.anchor)
  const { rpcUrl } = rpcMessage.options
  switch (rpcMessage.method) {
    case "eth_accounts": {
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const address = await adapter.getAddress(delegation)

      const response = { ...rpcBase, result: [address] }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "eth_signTypedData_v4": {
      const [, typedData] = rpcMessage.params
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const result = await adapter.signTypedData(
        JSON.parse(typedData),
        delegation,
      )
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_signTypedData_v4", {
        response,
      })
      return response
    }
    case "eth_sendTransaction": {
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const { wait, ...result } = await adapter.sendTransaction(
        delegation,
        data?.populatedTransaction,
      )
      const response = { ...rpcBase, result: result.hash }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "personal_sign": {
      const [message] = rpcMessage.params
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const result = await adapter.signMessage(message, delegation)
      const response = { ...rpcBase, result: result }
      console.debug("ExecuteProcedureService personal_sign", {
        response,
      })
      return response
    }
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
