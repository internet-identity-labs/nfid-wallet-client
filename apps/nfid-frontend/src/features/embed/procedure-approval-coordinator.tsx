import { TransactionRequest } from "@ethersproject/abstract-provider"
import React from "react"
import useSWR from "swr"

import { ProviderError } from "@nfid/integration"
import { FunctionCall, Method } from "@nfid/integration-ethereum"

import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { AuthChooseAccount } from "../authentication/3rd-party/choose-account"
import { ApproveIcGetDelegationSdkResponse } from "../authentication/3rd-party/choose-account/types"
import { RequestCanisterCall } from "../sdk/request-canister-call"
import { RequestTransfer } from "../sdk/request-transfer"
import { IRequestTransferResponse } from "../sdk/request-transfer/types"
import MappedFallback from "./components/fallback"
import { RPCMessage } from "./services/rpc-receiver"
import { Loader } from "./ui/loader"
import { populateTransactionData } from "./util/populateTxService"

type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  rpcMessageDecoded?: FunctionCall
  populatedTransaction?: [TransactionRequest, ProviderError | undefined]
  onConfirm: (data?: {
    populatedTransaction: [TransactionRequest, ProviderError | undefined]
  }) => void
  onRequestICDelegation?: (
    thirdPartyAuthSession: ApproveIcGetDelegationSdkResponse,
  ) => void
  onRequestICTransfer?: (
    thirdPartyAuthSession: IRequestTransferResponse,
  ) => void
  onReset: () => void
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
  BidOrder: React.lazy(() => import("./components/fallback")),
  bulkPurchase: React.lazy(() => import("./components/batch-buy")),
  burn: React.lazy(() => import("./components/fallback")),
  cancel: React.lazy(() => import("./components/fallback")),

  directAcceptBid: React.lazy(() => import("./components/fallback")),
  safeTransferFrom: React.lazy(() => import("./components/fallback")),

  Mint721: React.lazy(() => import("./components/lazy-mint")),
  Mint1155: React.lazy(() => import("./components/lazy-mint")),

  sell: React.lazy(() => import("./components/sell")),
  personalSign: React.lazy(() => import("./components/sign-message")),
  setApprovalForAll: React.lazy(() => import("./components/fallback")),
  approve: React.lazy(() => import("./components/fallback")),
}

const hasMapped = (messageInterface: string = "") =>
  !!componentMap[messageInterface as Method]

interface ProcedureApprovalCoordinatorProps extends ApproverCmpProps {
  disableConfirmButton?: boolean
  authSession: AuthSession
  authRequest: Partial<AuthorizationRequest>
}
export const ProcedureApprovalCoordinator: React.FC<
  ProcedureApprovalCoordinatorProps
> = ({
  appMeta,
  authRequest,
  rpcMessage,
  rpcMessageDecoded,
  onConfirm,
  onRequestICDelegation = () => new Error("Not implemented"),
  onRequestICTransfer = () => new Error("Not implemented"),
  onReset,
  onReject,
}) => {
  console.debug("ProcedureApprovalCoordinator", { rpcMessage })

  const {
    data: populatedTransaction,
    isLoading: isLoadingPopulateTransaction,
  } = useSWR(
    rpcMessage.method === "eth_sendTransaction"
      ? [rpcMessage, "populateTransactionData"]
      : null,
    async ([rpcMessage]) => {
      return await populateTransactionData(rpcMessage)
    },
    { refreshInterval: 3 * 1000 },
  )

  const handleOnConfirmSignature = React.useCallback(() => {
    return populatedTransaction
      ? onConfirm({ populatedTransaction })
      : onConfirm()
  }, [onConfirm, populatedTransaction])

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
              disableConfirmButton: isLoadingPopulateTransaction,
              onConfirm: handleOnConfirmSignature,
              onReject,
              onReset,
            }}
          />
        </React.Suspense>
      )

    case ["ic_getDelegation"].includes(rpcMessage.method):
      return (
        <AuthChooseAccount
          onReset={onReset}
          appMeta={appMeta}
          authRequest={authRequest as AuthorizationRequest}
          handleSelectAccount={onRequestICDelegation}
        />
      )

    case ["ic_requestTransfer"].includes(rpcMessage.method):
      return (
        <RequestTransfer
          origin={authRequest.derivationOrigin ?? authRequest.hostname!}
          appMeta={appMeta}
          amount={rpcMessage.params[0]?.amount}
          derivationOrigin={rpcMessage.params[0]?.derivationOrigin}
          destinationAddress={rpcMessage.params[0].receiver}
          onConfirmIC={onRequestICTransfer}
          tokenId={rpcMessage.params[0]?.tokenId}
        />
      )

    case ["ic_canisterCall"].includes(rpcMessage.method):
      return (
        <RequestCanisterCall
          origin={authRequest.derivationOrigin ?? authRequest.hostname!}
          appMeta={appMeta}
          method={rpcMessage.params[0]?.method}
          canisterID={rpcMessage.params[0]?.canisterId}
          args={rpcMessage.params[0]?.parameters}
          onConfirm={onConfirm}
          onReject={onReject}
        />
      )

    default:
      return (
        <MappedFallback
          {...{
            rpcMessage,
            appMeta,
            disableConfirmButton: isLoadingPopulateTransaction,
            rpcMessageDecoded,
            populatedTransaction,
            onConfirm: handleOnConfirmSignature,
            onReject,
          }}
        />
      )
  }
}
