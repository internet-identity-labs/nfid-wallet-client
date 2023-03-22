import { nfidEthWallet } from "@nfid/integration"

import {
  ConnectAccountService,
  ConnectAccountServiceContext,
} from "./connect-account-service"
import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"
import { SignTypedDataService } from "./sign-typed-data"

type CommonContext = { rpcMessage?: RPCMessage }

type ExecuteProcedureServiceContext = CommonContext &
  ConnectAccountServiceContext

type ExecuteProcedureServiceEvents = {
  type: string
  data?: { hostname: string; accountId: string }
}

export const ExecuteProcedureService = async (
  { rpcMessage, authSession, authRequest }: ExecuteProcedureServiceContext,
  { data }: ExecuteProcedureServiceEvents,
): Promise<RPCResponse> => {
  if (!rpcMessage)
    throw new Error("ExecuteProcedureService: missing rpcMessage")
  if (!authSession)
    throw new Error("ExecuteProcedureService: missing authSession")

  const rpcBase = { ...RPC_BASE, id: rpcMessage.id }
  switch (rpcMessage.method) {
    case "eth_accounts": {
      if (!data) throw new Error("selected account information missing")
      const result = await ConnectAccountService(
        { authRequest, authSession },
        { data },
      )
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "eth_signTypedData_v4": {
      const result = await SignTypedDataService({ authSession, rpcMessage })
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_signTypedData_v4", {
        response,
      })
      return response
    }
    case "eth_sendTransaction":
      const result = await nfidEthWallet.sendTransaction(rpcMessage.params[0])
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
