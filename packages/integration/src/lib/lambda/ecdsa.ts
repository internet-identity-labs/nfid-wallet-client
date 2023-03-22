import { Cbor, QueryFields } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { DelegationIdentity } from "@dfinity/identity"
import { Signature } from "ethers"

import { KeyPair } from "../_ic_api/ecdsa-signer.d"
import { ecdsaSigner, replaceActorIdentity } from "../actors"
import { ic } from "../agent/index"
import { getTransformedRequest } from "./util"

export async function registerECDSA(
  identity: DelegationIdentity,
): Promise<string> {
  const url = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  await replaceActorIdentity(ecdsaSigner, identity)
  const request = await getRegisterRequest(identity)
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    const kp: KeyPair = await response.json()
    await ecdsaSigner.add_kp(kp)
    return kp.public_key
  })
}

export async function getPublicKey(
  identity: DelegationIdentity,
): Promise<string> {
  await replaceActorIdentity(ecdsaSigner, identity)
  const response = await ecdsaSigner.get_kp()
  if (response.key_pair.length === 0) {
    return registerECDSA(identity)
  }
  return response.key_pair[0].public_key
}

export async function signECDSA(
  keccak: string,
  identity: DelegationIdentity,
): Promise<Signature> {
  const url = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  const request = await getSignCBORRequest(identity, keccak)
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    const signature: Signature = await response.json()
    return signature
  })
}

export async function getSignCBORRequest(
  identity: DelegationIdentity,
  keccak: string,
) {
  const fields: QueryFields = {
    methodName: "get_kp",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[]]),
  }
  const request: any = await getTransformedRequest(
    identity,
    ECDSA_SIGNER_CANISTER_ID,
    fields,
  )
  const cbor = Cbor.encode(request.body)
  return {
    cbor: toHexString(cbor),
    keccak,
  }
}

export async function getRegisterRequest(identity: DelegationIdentity) {
  const fields: QueryFields = {
    methodName: "get_principal",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[]]),
  }
  const request: any = await getTransformedRequest(
    identity,
    ECDSA_SIGNER_CANISTER_ID,
    fields,
  )
  const body = Cbor.encode(request.body)
  return {
    cbor: toHexString(body),
  }
}
