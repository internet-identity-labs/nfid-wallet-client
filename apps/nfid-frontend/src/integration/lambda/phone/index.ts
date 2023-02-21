import { Cbor, QueryFields } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import nacl from "tweetnacl"
import nacl_util from "tweetnacl-util"

import { ic } from "@nfid/integration"

import { getTransformedRequest } from "frontend/integration/lambda/util/util"

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

  if (!response.ok) {
    const errorObject = await response.json().then((err) => err)
    console.log({ errorObject })
    throw Error(errorObject.error)
  }

  const data = await response.json()

  return data.phoneNumberEncrypted
}
