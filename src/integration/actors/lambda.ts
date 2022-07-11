import { Signature } from "@dfinity/agent"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { Principal } from "@dfinity/principal"
import nacl from "tweetnacl"
import nacl_util from "tweetnacl-util"

<<<<<<< HEAD:src/integration/lambda/phone/index.ts
import { rawId } from "frontend/integration/actors"
=======
import { rawId } from "."
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/actors/lambda.ts

declare const VERIFY_PHONE_NUMBER: string

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
  principal: Principal,
): Promise<{}> {
  const isLocal = true
  const url = isLocal ? "/verify" : VERIFY_PHONE_NUMBER
  const trimmed = phoneNumber.replace(/\s/g, "")
  const message = nacl_util.decodeUTF8(trimmed)
  const signature = (await rawId?.sign(message)) as Signature

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: trimmed,
      publicKey: rawId?.getPrincipal().toHex(),
      signature: toHexString(signature),
      delegation: rawId?.getDelegation().toJSON(),
    }),
  })

  const data = await response.json()

  return { body: data, status: response.status }
}
