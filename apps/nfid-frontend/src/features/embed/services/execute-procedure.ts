import { TransactionRequest } from "@ethersproject/abstract-provider"

import {
  DelegationWalletAdapter,
  ProviderError,
  ThirdPartyAuthSession,
  authState,
  renewDelegation,
} from "@nfid/integration"
import { prepareClientDelegate } from "@nfid/integration"

import { ApproveIcGetDelegationSdkResponse } from "frontend/features/authentication/3rd-party/choose-account/types"
import { IRequestTransferResponse } from "frontend/features/request-transfer/types"
import { RequestStatus } from "frontend/features/types"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { AuthSession } from "frontend/state/authentication"

import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-receiver"

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
  | {
      type: "APPROVE_IC_GET_DELEGATION"
      data?: ApproveIcGetDelegationSdkResponse
    }
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
      console.debug("debug delegate ExecuteProcedureService ic_getDelegation", {
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
        console.debug("ExecuteProcedureService ic_getDelegation", { delegate })
        const delegations = [prepareClientDelegate(delegate.signedDelegation)]
        // FIXME: figure out what public key to use here
        // const userPublicKey = rpcMessage.params[0].sessionPublicKey // fails
        // const userPublicKey = new Uint8Array( // fails
        //   delegate.signedDelegation.publicKey,
        // )
        // const userPublicKey = new Uint8Array(delegate.userPublicKey) // fails
        const userPublicKey = delegate.userPublicKey // fails

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
      console.debug(
        "debug delegate ExecuteProcedureService ic_renewDelegation",
        { rpcMessage },
      )
      try {
        const { targets, sessionPublicKey } = rpcMessage.params[0]

        console.debug(
          "debug delegation ExecuteProcedureService ic_renewDelegation",
          {
            targets,
            sessionPublicKey,
          },
        )

        const delegationIdentity = authState.get().delegationIdentity
        if (!delegationIdentity) throw new Error("missing delegationIdentity")
        if (!requestOrigin) throw new Error("missing requestOrigin")

        const delegate = await renewDelegation(
          delegationIdentity,
          requestOrigin,
          targets,
          sessionPublicKey,
        )

        const delegations = [prepareClientDelegate(delegate)]
        // FIXME: figure out what public key to use here
        // const userPublicKey = rpcMessage.params[0].sessionPublicKey
        // const userPublicKey = rpcMessage.params[0].sessionPublicKey // fails
        const userPublicKey = new Uint8Array(delegate.publicKey)

        return { ...rpcBase, result: { delegations, userPublicKey } }
      } catch (error: any) {
        console.error("ExecuteProcedureService ic_renewDelegation", { error })
        return { ...rpcBase, error: { code: 500, message: error.message } }
      }
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
