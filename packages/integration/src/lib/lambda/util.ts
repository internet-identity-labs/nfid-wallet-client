import { Endpoint, Expiry, QueryFields, ReadRequest } from "@dfinity/agent"
import * as Agent from "@dfinity/agent"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1"
import { Principal } from "@dfinity/principal"

import { idlFactory as imIDL } from "../_ic_api/identity_manager"
import { _SERVICE as IdentityManager } from "../_ic_api/identity_manager.d"
import { actor, im, replaceActorIdentity } from "../actors"

const DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS = 5 * 60 * 1000
const LAMBDA_IDENTITY = process.env["LAMBDA_IDENTITY"]

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

export const getIdentity = (seed: string): Ed25519KeyIdentity => {
  const seedEncoded: Uint8Array = new TextEncoder().encode(seed)
  return Ed25519KeyIdentity.generate(seedEncoded)
}

export async function getLambdaActor(): Promise<
  Agent.ActorSubclass<IdentityManager>
> {
  const identity = getLambdaIdentity()
  const lambdaIm = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
  await replaceActorIdentity(im, identity)
  return lambdaIm
}

export function getLambdaIdentity(): Secp256k1KeyIdentity {
  if (!LAMBDA_IDENTITY) {
    throw Error("No LAMBDA_IDENTITY provided.")
  }
  const secretKey = Agent.fromHex(LAMBDA_IDENTITY.trim())
  return Secp256k1KeyIdentity.fromSecretKey(secretKey)
}
