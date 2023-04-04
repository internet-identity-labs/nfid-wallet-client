import { TransactionRequest } from "@ethersproject/abstract-provider"

import { FunctionCall } from "@nfid/integration-ethereum"

import { RPCMessage } from "frontend/features/embed/services/rpc-receiver"
import { AuthorizingAppMeta } from "frontend/state/authorization"

export type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  populatedTransaction?: TransactionRequest | Error
  onConfirm: (data?: any) => void
  onReject: (reason?: any) => void
}
