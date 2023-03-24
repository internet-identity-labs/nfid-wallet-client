import { DelegationWalletAdapter } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"

type CommonContext = { rpcMessage?: RPCMessage; authSession?: AuthSession }

type ExecuteProcedureServiceContext = CommonContext

function removeEmptyKeys(data: { [key: string]: unknown }) {
  return Object.keys(data).reduce(
    (acc, key) => ({
      ...acc,
      ...(data[key] ? { [key]: data[key] } : {}),
    }),
    {},
  )
}

export const ExecuteProcedureService = async ({
  rpcMessage,
  authSession,
}: ExecuteProcedureServiceContext): Promise<RPCResponse> => {
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
      const data = removeEmptyKeys(rpcMessage?.params[0])
      console.debug("ExecuteProcedureService eth_sendTransaction", { data })

      const { wait, ...result } = await adapter.sendTransaction(
        data,
        delegation,
      )
      const response = { ...rpcBase, result: result.hash }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
