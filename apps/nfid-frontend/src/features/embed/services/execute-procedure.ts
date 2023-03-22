import {
  ConnectAccountService,
  ConnectAccountServiceContext,
} from "./connect-account-service"
import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"

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

  const rpcResponse = { ...RPC_BASE, id: rpcMessage.id }
  switch (rpcMessage.method) {
    case "eth_accounts":
      if (!data) throw new Error("selected account information missing")
      const result = await ConnectAccountService(
        { authRequest, authSession },
        { data },
      )
      return { ...rpcResponse, result }
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
