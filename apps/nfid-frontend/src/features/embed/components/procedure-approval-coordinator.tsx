import React from "react"

import { BlurredLoader } from "@nfid-frontend/ui"
import { FunctionCall } from "@nfid/integration-ethereum"

import { NFIDConnectAccountCoordinator } from "frontend/features/embed-connect-account/coordinator"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage } from "../services/rpc-receiver"

type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  onConfirm: (data?: any) => void
  onReject: (reason?: any) => void
}

interface ComponentMap {
  [messageInterface: string]: React.ComponentType<ApproverCmpProps>
}

const componentMap: ComponentMap = {
  Item: React.lazy(
    () => import("frontend/features/embed-controller/components/buy"),
  ),
  Sell: React.lazy(
    () => import("frontend/features/embed-controller/components/sell"),
  ),
}

const hasMapped = (messageInterface: string = "") =>
  !!componentMap[messageInterface]

interface ProcedureApprovalCoordinatorProps extends ApproverCmpProps {
  authSession: AuthSession
}
export const ProcedureApprovalCoordinator: React.FC<
  ProcedureApprovalCoordinatorProps
> = ({ appMeta, rpcMessage, rpcMessageDecoded, onConfirm, onReject }) => {
  switch (true) {
    case hasMapped(rpcMessageDecoded?.interface):
      const ApproverCmp = componentMap[rpcMessageDecoded?.interface as string]
      return (
        <React.Suspense
          fallback={
            <BlurredLoader
              loadingMessage={`${rpcMessageDecoded?.interface} flow...`}
            />
          }
        >
          <ApproverCmp
            {...{ rpcMessage, appMeta, rpcMessageDecoded, onConfirm, onReject }}
          />
        </React.Suspense>
      )

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
