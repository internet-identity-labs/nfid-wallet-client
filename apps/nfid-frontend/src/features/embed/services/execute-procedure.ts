import { TransactionRequest } from "@ethersproject/abstract-provider"

import {
  DelegationWalletAdapter,
  ProviderError,
  ThirdPartyAuthSession,
  authState,
  renewDelegation,
} from "@nfid/integration"

import { IRequestTransferResponse } from "frontend/features/request-transfer/types"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { prepareClientDelegate } from "frontend/integration/windows"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"
import { ApproveIcGetDelegationSdkResponse } from "frontend/features/authentication/3rd-party/choose-account/types"
import { RequestStatus } from "frontend/features/types"

type CommonContext = {
  rpcMessage?: RPCMessage
  authSession?: AuthSession
  requestOrigin?: string
}

export type ApproveSignatureEvent = {
  populatedTransaction?: [TransactionRequest, ProviderError | undefined]
}

type ExecuteProcedureEvent =
  | { type: "APPROVE"; data?: ApproveSignatureEvent }
  | { type: "APPROVE_IC_GET_DELEGATION"; data?: ApproveIcGetDelegationSdkResponse }
  | { type: "APPROVE_IC_REQUEST_TRANSFER"; data?: IRequestTransferResponse }
  | { type: "" }

type ExecuteProcedureServiceContext = CommonContext

export const ExecuteProcedureService = async (
  { rpcMessage, authSession, requestOrigin }: ExecuteProcedureServiceContext,
  event: ExecuteProcedureEvent,
): Promise<RPCResponse> => {
  console.debug("ExecuteProcedureService", {
    rpcMessage,
    authSession,
    requestOrigin,
  })
  if (!rpcMessage)
    throw new Error("ExecuteProcedureService: missing rpcMessage")
  if (!authSession)
    throw new Error("ExecuteProcedureService: missing authSession")

  const rpcBase = { ...RPC_BASE, id: rpcMessage.id }
  const delegation = await getWalletDelegation(authSession.anchor)
  const { rpcUrl } = rpcMessage.options
  console.log({ rpcMessage, event })
  switch (rpcMessage.method) {
    case "ic_getDelegation": {
      if (event.type !== "APPROVE_IC_GET_DELEGATION")
        throw new Error("The event cannot be handled.")

      const data = event.data as ApproveIcGetDelegationSdkResponse
      if(data.status !== RequestStatus.SUCCESS)
        throw new Error(`The delegation cannot be obtained: ${data.errorMessage}`)

      const delegate = data.authSession as ThirdPartyAuthSession
      console.debug("ExecuteProcedureService ic_getDelegation", { delegate })
      const delegations = [prepareClientDelegate(delegate.signedDelegation)]
      const userPublicKey = delegate.userPublicKey

      return { ...rpcBase, result: { delegations, userPublicKey } }
    }
    case "ic_requestTransfer": {
      if (event.type !== "APPROVE_IC_REQUEST_TRANSFER")
        throw new Error("The event cannot be handled.")

      const result = event.data as IRequestTransferResponse
      if(result.status !== RequestStatus.SUCCESS)
        throw new Error(`The request cannot be completed: ${result.errorMessage}`)

      return { ...rpcBase, result }
    }
    case "eth_accounts": {
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const address = await adapter.getAddress(delegation)

      const response = { ...rpcBase, result: [address] }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "ic_renewDelegation": {
      console.debug("ExecuteProcedureService ic_renewDelegation")
      const { targets } = rpcMessage.params[0]
      console.debug("ExecuteProcedureService ic_renewDelegation", { targets })
      const delegationIdentity = authState.get().delegationIdentity
      if (!delegationIdentity) throw new Error("missing delegationIdentity")
      if (!requestOrigin) throw new Error("missing requestOrigin")

      let delegation
      try {
        delegation = await renewDelegation(
          delegationIdentity,
          requestOrigin,
          targets,
        )
      } catch (error) {
        console.error("ExecuteProcedureService ic_renewDelegation", { error })
        return { ...rpcBase, result: "error" }
      }
      console.debug("ExecuteProcedureService ic_renewDelegation", {
        delegation,
      })

      const delegations = [prepareClientDelegate(delegation)]
      const userPublicKey = delegation.publicKey

      return { ...rpcBase, result: { delegations, userPublicKey } }
    }
    case "eth_signTypedData_v4": {
      const [, typedData] = rpcMessage.params
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const result = await adapter.signTypedData(
        JSON.parse(typedData),
        delegation,
      )
      const response = { ...rpcBase, result }
      console.debug("ExecuteProcedureService eth_signTypedData_v4", {
        response,
      })
      return response
    }
    case "eth_sendTransaction": {
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const { wait, ...result } = await adapter.sendTransaction(
        delegation,
        event.type === "APPROVE" ? event.data?.populatedTransaction : undefined,
      )
      const response = { ...rpcBase, result: result.hash }
      console.debug("ExecuteProcedureService eth_accounts", {
        response,
      })
      return response
    }
    case "personal_sign": {
      const [message] = rpcMessage.params
      const adapter = new DelegationWalletAdapter(rpcUrl)
      const result = await adapter.signMessage(message, delegation)
      const response = { ...rpcBase, result: result }
      console.debug("ExecuteProcedureService personal_sign", {
        response,
      })
      return response
    }
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
