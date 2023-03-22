import { DecodeResponse } from "packages/integration-ethereum/src/lib/constant"

import { NFIDConnectAccountCoordinator } from "frontend/features/embed-connect-account/coordinator"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage } from "../services/rpc-receiver"

interface ComponentMap {
  [messageInterface: string]: () => JSX.Element
}

const componentMap: ComponentMap = {
  BatchBuyRequest: () => <div>BatchBuyRequest</div>,
  Burn: () => <div>Burn</div>,
}

const hasMapped = (messageInterface: string = "") =>
  !!componentMap[messageInterface]

type ProcedureApprovalCoordinatorProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: DecodeResponse
  authSession: AuthSession
  onConfirm: (data?: any) => void
}
export const ProcedureApprovalCoordinator: React.FC<
  ProcedureApprovalCoordinatorProps
> = ({ appMeta, rpcMessage, rpcMessageDecoded, onConfirm }) => {
  switch (true) {
    case hasMapped(rpcMessageDecoded?.interface):
      const ApproverCmp = componentMap[rpcMessageDecoded?.interface as string]
      return <ApproverCmp />

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
