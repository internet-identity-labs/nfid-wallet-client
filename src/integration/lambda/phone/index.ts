import {
  Cbor,
  Endpoint,
  Expiry,
  QueryFields,
  ReadRequest,
} from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import nacl from "tweetnacl"
import nacl_util from "tweetnacl-util"

import { ic } from "frontend/integration/actors"
import { authState } from "frontend/integration/internet-identity"

declare const VERIFY_PHONE_NUMBER: string
declare const IDENTITY_MANAGER_CANISTER_ID: string

if (!VERIFY_PHONE_NUMBER) {
  throw new Error(`Phone verification lambda is not defined.`)
}

export function verifySignature(
  msg: string,
  hexSignature: string,
  principal: Principal,
) {
  const signature = Uint8Array.from(
    (hexSignature.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
  )
  return nacl.sign.detached.verify(
    nacl_util.decodeUTF8(msg),
    signature,
    principal.toUint8Array(),
  )
}

/**
 * Send an SMS token for the user to validate. Associates phone number to principal on success.
 * @param phoneNumber
 * @param principal
 * @returns Empty object on success
 */
export async function verifyPhoneNumber(
  phoneNumber: string,
  identity: DelegationIdentity,
): Promise<string> {
  const url = ic.isLocal ? "/verify" : VERIFY_PHONE_NUMBER
  const trimmed = phoneNumber.replace(/\s/g, "")
  const fields: QueryFields = {
    methodName: "validate_signature",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[trimmed]]),
  }

  const request: any = await getTransformedRequest(
    identity,
    IDENTITY_MANAGER_CANISTER_ID,
    fields,
  )

  let body = Cbor.encode(request.body)
  let str = toHexString(body)

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: str }),
  })

  console.debug("verifyPhoneNumber", {
    phoneNumber,
    fields,
    canister: IDENTITY_MANAGER_CANISTER_ID,
    response,
    principal: identity.getPrincipal().toText(),
  })

  if (!response.ok) throw new Error(await response.text())

  const data = await response.json()

  return data.phoneNumberEncrypted
}

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
