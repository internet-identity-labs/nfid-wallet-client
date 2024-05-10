import { Endpoint, Expiry, QueryFields, ReadRequest } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { Ed25519KeyIdentity } from "@dfinity/identity"
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

export async function getLambdaCredentials() {
  const account = await im.get_account()
  const key = await getPublicKey(authState.get().delegationIdentity!, Chain.IC)
  const rootPrincipalId = account.data[0]?.principal_id
  const principal = Ed25519KeyIdentity.fromParsedJson([key, "0"]).getPrincipal()

  return {
    rootPrincipalId,
    publicKey: principal.toText(),
  }
}
