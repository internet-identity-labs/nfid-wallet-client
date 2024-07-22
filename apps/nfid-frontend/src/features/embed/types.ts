import { RPCMessage } from "frontend/features/embed/services/rpc-receiver"
import { AuthorizingAppMeta } from "frontend/state/authorization"

export type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  onConfirm: (data?: any) => void
  onReject: (reason?: any) => void
}
