import React from "react"

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

import { RPCMessage } from "./services/rpc-receiver"

type ApproverCmpProps = {
  appMeta: AuthorizingAppMeta
  rpcMessage: RPCMessage
  onConfirm: (data?: { populatedTransaction: [undefined] }) => void
  onRequestICDelegation?: (
    thirdPartyAuthSession: ApproveIcGetDelegationSdkResponse,
  ) => void
  onRequestICTransfer?: (
    thirdPartyAuthSession: IRequestTransferResponse,
  ) => void
  onReset: () => void
  onReject: (reason?: any) => void
}

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
  onConfirm,
  onRequestICDelegation = () => new Error("Not implemented"),
  onRequestICTransfer = () => new Error("Not implemented"),
  onReset,
  onReject,
}) => {
  console.debug("ProcedureApprovalCoordinator", { rpcMessage })

  switch (true) {
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
          memo={rpcMessage.params[0]?.memo}
          onConfirmIC={onRequestICTransfer}
          tokenId={rpcMessage.params[0]?.tokenId}
        />
      )

    case ["ic_canisterCall"].includes(rpcMessage.method):
      return (
        <RequestCanisterCall
          origin={authRequest.derivationOrigin ?? authRequest.hostname!}
          method={rpcMessage.params[0]?.method}
          canisterID={rpcMessage.params[0]?.canisterId}
          args={rpcMessage.params[0]?.parameters}
          onConfirm={onConfirm}
          onReject={onReject}
        />
      )

    default: {
      onReject("Unknown method")
      return <div></div>
    }
  }
}
