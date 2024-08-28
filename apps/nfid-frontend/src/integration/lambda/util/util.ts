import { Endpoint, Expiry, QueryFields, ReadRequest } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { getPublicKey, Chain } from "packages/integration/src/lib/lambda/ecdsa"

import { authState, im } from "@nfid/integration"

const DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS = 5 * 60 * 1000

export async function getTransformedRequest(
  identity: DelegationIdentity,
  canisterId: string,
  fields: QueryFields,
) {
  const canister =
    typeof canisterId === "string" ? Principal.fromText(canisterId) : canisterId
  const sender = identity.getPrincipal()
  const request = {
    request_type: "query",
    canister_id: canister,
    method_name: fields.methodName,
    arg: fields.arg,
    sender,
    ingress_expiry: new Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS),
  } as ReadRequest
  return await identity.transformRequest({
    request: {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/cbor" }),
    },
    endpoint: "query" as Endpoint.Query,
    body: request,
  })
}

export const getPrincipal = async () => {
  const identity = authState.get().delegationIdentity
  const principalString = await getPublicKey(identity!, Chain.IC)
  return Principal.fromText(principalString)
}

export async function getLambdaCredentials() {
  const identity = authState.get().delegationIdentity
  if (!identity) throw new Error("Identity not found. Please try again")
  const account = await im.get_account()
  const principal = await getPublicKey(identity, Chain.IC)
  const rootPrincipalId = account.data[0]?.principal_id

  return {
    rootPrincipalId,
    publicKey: principal,
  }
}
