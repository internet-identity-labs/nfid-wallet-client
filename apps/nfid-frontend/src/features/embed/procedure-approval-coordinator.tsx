import { TransactionRequest } from "@ethersproject/abstract-provider"
import React from "react"

import { ProviderError } from "@nfid/integration"
import { FunctionCall, Method } from "@nfid/integration-ethereum"

import { NFIDConnectAccountCoordinator } from "frontend/features/embed-connect-account/coordinator"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import MappedDefaultSend from "./components/default-send"
import { RPCMessage } from "./services/rpc-receiver"
import { Loader } from "./ui/loader"

type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  populatedTransaction?: [TransactionRequest, ProviderError | undefined]
  onConfirm: (data?: any) => void
  onReject: (reason?: any) => void
}

type ComponentMap = {
  [method in Method]: React.ComponentType<ApproverCmpProps>
}

const componentMap: ComponentMap = {
  directPurchase: React.lazy(() => import("./components/buy")),
  createToken: React.lazy(() => import("./components/deploy-collection")),
  mintAndTransfer: React.lazy(() => import("./components/mint")),
  SellOrder: React.lazy(() => import("./components/sell")),
  BidOrder: React.lazy(() => import("./components/default-send")),
  bulkPurchase: React.lazy(() => import("./components/batch-buy")),
  burn: React.lazy(() => import("./components/default-send")),
  cancel: React.lazy(() => import("./components/default-send")),

  directAcceptBid: React.lazy(() => import("./components/default-send")),
  safeTransferFrom: React.lazy(() => import("./components/default-send")),

  Mint721: React.lazy(() => import("./components/lazy-mint")),
  Mint1155: React.lazy(() => import("./components/lazy-mint")),

  sell: React.lazy(() => import("./components/sell")),
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
        <React.Suspense fallback={<Loader />}>
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
        <MappedDefaultSend
          {...{
            rpcMessage,
            appMeta,
            rpcMessageDecoded,
            populatedTransaction,
            onConfirm,
            onReject,
          }}
        />
      )
  }
}
