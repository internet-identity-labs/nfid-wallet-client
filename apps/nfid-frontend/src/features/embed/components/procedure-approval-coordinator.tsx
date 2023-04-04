import { TransactionRequest } from "@ethersproject/abstract-provider"
import React from "react"

import { BlurredLoader } from "@nfid-frontend/ui"
import { FunctionCall, Method } from "@nfid/integration-ethereum"

import { NFIDConnectAccountCoordinator } from "frontend/features/embed-connect-account/coordinator"
import { DefaultSign } from "frontend/features/embed-controller/components/fallbacks/signTypedData"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCMessage } from "../services/rpc-receiver"

type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  populatedTransaction?: [TransactionRequest, Error | undefined]
  onConfirm: (data?: any) => void
  onReject: (reason?: any) => void
}

type ComponentMap = {
  [method in Method]: React.ComponentType<ApproverCmpProps>
}

const componentMap: ComponentMap = {
  directPurchase: React.lazy(
    () => import("frontend/features/embed-controller/components/buy"),
  ),
  createToken: React.lazy(
    () =>
      import("frontend/features/embed-controller/components/deploy-collection"),
  ),
  mintAndTransfer: React.lazy(
    () => import("frontend/features/embed-controller/components/mint"),
  ),
  SellOrder: React.lazy(
    () => import("frontend/features/embed-controller/components/sell"),
  ),
  BidOrder: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),
  bulkPurchase: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),
  burn: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),
  cancel: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),
  directAcceptBid: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),
  safeTransferFrom: React.lazy(
    () =>
      import(
        "frontend/features/embed-controller/components/fallbacks/signTypedData"
      ),
  ),

  Mint721: React.lazy(
    () => import("frontend/features/embed-controller/components/lazy-mint"),
  ),
  Mint1155: React.lazy(
    () => import("frontend/features/embed-controller/components/lazy-mint"),
  ),

  sell: React.lazy(
    () => import("frontend/features/embed-controller/components/sell"),
  ),
}

const hasMapped = (messageInterface: string = "") =>
  !!componentMap[messageInterface as Method]

interface ProcedureApprovalCoordinatorProps extends ApproverCmpProps {
  authSession: AuthSession
}
export const ProcedureApprovalCoordinator: React.FC<
  ProcedureApprovalCoordinatorProps
> = ({
  appMeta,
  rpcMessage,
  rpcMessageDecoded,
  populatedTransaction,
  onConfirm,
  onReject,
}) => {
  switch (true) {
    case hasMapped(rpcMessageDecoded?.method):
      const ApproverCmp = componentMap[rpcMessageDecoded?.method as Method]
      return (
        <React.Suspense
          fallback={
            <BlurredLoader
              loadingMessage={`${rpcMessageDecoded?.interface} flow...`}
            />
          }
        >
          <ApproverCmp
            {...{
              rpcMessage,
              appMeta,
              rpcMessageDecoded,
              populatedTransaction,
              onConfirm,
              onReject,
            }}
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
      return (
        <DefaultSign
          data={rpcMessage?.params[1]}
          onCancel={onReject}
          onSign={onConfirm}
        />
      )
  }
}
