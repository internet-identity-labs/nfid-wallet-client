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
  const adapter = new DelegationWalletAdapter(
    "https://eth-goerli.g.alchemy.com/v2/KII7f84ZxFDWMdnm_CNVW5hI8NfbnFhZ",
  )
  const delegation = await getWalletDelegation(authSession.anchor)
  switch (rpcMessage.method) {
    case "eth_accounts": {
      const address = await adapter.getAddress(delegation)

      const response = { ...rpcBase, result: [address] }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "eth_signTypedData_v4": {
      const result = await adapter.signTypedData(
        JSON.parse(rpcMessage.params[1]),
        delegation,
      )
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_signTypedData_v4", {
        response,
      })
      return response
    }
    case "eth_sendTransaction": {
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
      const result = await adapter.signMessage(rpcMessage.params[0], delegation)
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
