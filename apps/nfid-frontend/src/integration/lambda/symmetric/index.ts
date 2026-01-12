import { Cbor, QueryFields } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationIdentity } from "@dfinity/identity"
import { createDecipheriv } from "browser-crypto"
import { Buffer } from "buffer"

import { ic } from "@nfid/integration"

import { getTransformedRequest } from "frontend/integration/lambda/util/util"

export async function decryptStringForIdentity(
  encrypted: string,
  identity: DelegationIdentity,
) {
  const key = await symmetric(identity)
  return decrypt(encrypted, key)
}

export async function symmetric(identity: DelegationIdentity) {
  try {
    return await getSymmetricKey(identity)
  } catch (e) {
    throw new Error("There was an issue getting symmetric key." + e)
  }
}

export async function getSymmetricKey(
  identity: DelegationIdentity,
): Promise<string> {
  const url = ic.isLocal ? "/symmetric" : AWS_SYMMETRIC
  const fields: QueryFields = {
    methodName: "validate_signature",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[]]),
  }
  const request: any = await getTransformedRequest(
    identity,
    IDENTITY_MANAGER_CANISTER_ID,
    fields,
  )

  const body = Cbor.encode(request.body)
  const str = toHexString(body)

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: str }),
  })

  if (!response.ok) throw new Error(await response.text())

  const data = await response.json()

  return data.key
}

function decrypt(encrypted: string, key: string) {
  const secretBuffer = Buffer.from(key, "hex")
  const cipher = createDecipheriv("aes-256-ecb", secretBuffer, "")
  let decryptedString = cipher.update(encrypted, "hex", "utf8")
  decryptedString += cipher.final("utf8")
  return decryptedString
}
