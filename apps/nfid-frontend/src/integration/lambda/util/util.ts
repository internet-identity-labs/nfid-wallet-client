import { Endpoint, Expiry, QueryFields, ReadRequest } from "@icp-sdk/core/agent"
import { DelegationIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

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
    ingress_expiry: Expiry.fromDeltaInMilliseconds(
      DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS,
    ),
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
