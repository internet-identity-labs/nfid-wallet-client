import { getGlobalDelegation } from "@nfid/integration"
import {
  ThirdPartyAuthSession,
  authState,
  executeCanisterCall,
  prepareClientDelegate,
  renewDelegation,
} from "@nfid/integration"

import { ApproveIcGetDelegationSdkResponse } from "frontend/features/authentication/3rd-party/choose-account/types"
import { IRequestTransferResponse } from "frontend/features/sdk/request-transfer/types"
import { RequestStatus } from "frontend/features/types"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"

type CommonContext = {
  rpcMessage?: RPCMessage
  authSession?: AuthSession
}

export type ApproveSignatureEvent = {}

type ExecuteProcedureEvent =
  | { type: "APPROVE"; data?: ApproveSignatureEvent }
  | {
      type: "APPROVE_IC_GET_DELEGATION"
      data?: ApproveIcGetDelegationSdkResponse
    }
  | { type: "APPROVE_IC_REQUEST_TRANSFER"; data?: IRequestTransferResponse }
  | { type: "" }

type ExecuteProcedureServiceContext = CommonContext

export const ExecuteProcedureService = async (
  { rpcMessage, authSession }: ExecuteProcedureServiceContext,
  event: ExecuteProcedureEvent,
): Promise<RPCResponse> => {
  console.debug("ExecuteProcedureService", {
    rpcMessage,
    authSession,
  })
  if (!rpcMessage)
    throw new Error("ExecuteProcedureService: missing rpcMessage")
  if (!authSession)
    throw new Error("ExecuteProcedureService: missing authSession")

  const rpcBase = { ...RPC_BASE, id: rpcMessage.id, origin: rpcMessage.origin }
  console.log({ rpcMessage, event })
  switch (rpcMessage.method) {
    case "ic_getDelegation": {
      console.debug("ExecuteProcedureService ic_getDelegation", {
        rpcMessage,
      })
      try {
        if (event.type !== "APPROVE_IC_GET_DELEGATION")
          throw new Error("The event cannot be handled.")

        const data = event.data as ApproveIcGetDelegationSdkResponse
        if (data.status !== RequestStatus.SUCCESS)
          throw new Error(
            `The delegation cannot be obtained: ${data.errorMessage}`,
          )

        const delegate = data.authSession as ThirdPartyAuthSession
        const delegations = [prepareClientDelegate(delegate.signedDelegation)]
        const userPublicKey = delegate.userPublicKey

        return { ...rpcBase, result: { delegations, userPublicKey } }
      } catch (e: any) {
        return { ...rpcBase, error: { code: 500, message: e.message } }
      }
    }
    case "ic_requestTransfer": {
      try {
        if (event.type !== "APPROVE_IC_REQUEST_TRANSFER")
          throw new Error("The event cannot be handled.")

        const result = event.data as IRequestTransferResponse
        if (result.status !== RequestStatus.SUCCESS)
          throw new Error(
            `The request cannot be completed: ${result.errorMessage}`,
          )

        return { ...rpcBase, result: { hash: result.hash } }
      } catch (e: any) {
        return { ...rpcBase, error: { code: 500, message: e.message } }
      }
    }
    case "ic_renewDelegation": {
      console.debug("ExecuteProcedureService ic_renewDelegation", {
        rpcMessage,
      })
      try {
        const { targets, sessionPublicKey, derivationOrigin } =
          rpcMessage.params[0]

        console.debug("ExecuteProcedureService ic_renewDelegation", {
          targets,
          sessionPublicKey,
        })

        const delegationIdentity = authState.get().delegationIdentity
        if (!delegationIdentity) throw new Error("missing delegationIdentity")

        const delegate = await renewDelegation(
          delegationIdentity,
          derivationOrigin || rpcMessage.origin,
          targets,
          sessionPublicKey,
        )

        const delegations = [prepareClientDelegate(delegate)]
        const userPublicKey = new Uint8Array(delegate.publicKey)

        return { ...rpcBase, result: { delegations, userPublicKey } }
      } catch (error: any) {
        console.error("ExecuteProcedureService ic_renewDelegation", { error })
        return { ...rpcBase, error: { code: 500, message: error.message } }
      }
    }
    case "ic_canisterCall": {
      const identity = await getGlobalDelegation(
        authState.get().delegationIdentity!,
        [rpcMessage.params[0].canisterId],
      )

      try {
        const response = await executeCanisterCall(
          rpcMessage.params[0].derivationOrigin || rpcMessage.origin,
          identity,
          rpcMessage.params[0].method,
          rpcMessage.params[0].canisterId,
          rpcMessage.params[0].parameters,
        )
        return { ...rpcBase, result: response }
      } catch (error: any) {
        console.error("ExecuteProcedureService ic_canisterCall", { error })

        const json = JSON.parse(error.message)
        if ("error" in json) {
          return { ...rpcBase, error: { code: 400, message: json.error } }
        }

        return { ...rpcBase, error: { code: 500, message: error.message } }
      }
    }
    default:
      throw new Error("ExecuteProcedureService: unknown procedure")
  }
}
