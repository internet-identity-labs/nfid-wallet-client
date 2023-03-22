import { DecodeResponse } from "packages/integration-ethereum/src/lib/constant"

import { NFIDConnectAccountCoordinator } from "frontend/features/embed-connect-account/coordinator"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage } from "../services/rpc-receiver"

type ProcedureApprovalCoordinatorProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: DecodeResponse
  authSession: AuthSession
  onConfirm: (data?: any) => void
}
export const ProcedureApprovalCoordinator: React.FC<
  ProcedureApprovalCoordinatorProps
> = ({ appMeta, rpcMessage, onConfirm }) => {
  switch (true) {
    case rpcMessage.method === "eth_accounts":
      return (
        <NFIDConnectAccountCoordinator
          appMeta={appMeta}
          onConnect={(hostname, accountId) =>
            onConfirm({ hostname, accountId })
          }
        />
      )
    default:
      return <div>DefaultProcedureApprover</div>
  }
}
