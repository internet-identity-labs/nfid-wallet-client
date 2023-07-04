import { Cbor, PublicKey, QueryFields, SignIdentity } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ONE_MINUTE_IN_MS } from "@nfid/config"

import { KeyPair } from "../_ic_api/ecdsa-signer.d"
import { btcSigner, ecdsaSigner, replaceActorIdentity } from "../actors"
import { ic } from "../agent/index"
import { getTransformedRequest } from "./util"

export enum Chain {
  BTC = "BTC",
  ETH = "ETH",
  IC = "IC",
}

export async function registerECDSA(
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const url = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const signer = defineSigner(chain)
  await replaceActorIdentity(signer, identity)
  const request = await getRegisterRequest(identity, chain)
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    const kp: KeyPair = await response.json()
    await signer.add_kp(kp)
    return kp.public_key
  })
}

export async function ecdsaSign(
  keccak: string,
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })
  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    keccak,
  }
  const signUrl = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  return await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
}

export async function ecdsaRegisterNewKeyPair(
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })
  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
  }
  const registerAddressUrl = ic.isLocal
    ? `/ecdsa_register_address`
    : AWS_ECDSA_REGISTER_ADDRESS
  const response = await fetch(registerAddressUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
  return response.public_key
}

export async function getPublicKey(
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const signer = defineSigner(chain)
  await replaceActorIdentity(signer, identity)
  const response = await signer.get_kp()
  if (response.key_pair.length === 0) {
    return registerECDSA(identity, chain)
  }
  return response.key_pair[0].public_key
}

export async function signECDSA(
  keccak: string,
  identity: DelegationIdentity,
  chain: Chain,
) {
  const url = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  const request = await getSignCBORRequest(identity, keccak, chain)
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
}

export async function getSignCBORRequest(
  identity: DelegationIdentity,
  keccak: string,
  chain: Chain,
) {
  const fields: QueryFields = {
    methodName: "get_kp",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[]]),
  }
  const request: any = await getTransformedRequest(
    identity,
    defineCanisterId(chain),
    fields,
  )
  const cbor = Cbor.encode(request.body)
  return {
    cbor: toHexString(cbor),
    keccak,
    chain,
  }
}

function defineSigner(chain: Chain) {
  switch (chain) {
    case Chain.ETH:
      return ecdsaSigner
    case Chain.BTC:
      return btcSigner
    case Chain.IC:
      throw Error("Deprecated")
  }
}

function defineCanisterId(chain: Chain) {
  switch (chain) {
    case Chain.ETH:
      return ECDSA_SIGNER_CANISTER_ID
    case Chain.BTC:
      return BTC_SIGNER_CANISTER_ID
    case Chain.IC:
      throw Error("Deprecated")
  }
}

export async function getRegisterRequest(
  identity: DelegationIdentity,
  chain: Chain,
) {
  const fields: QueryFields = {
    methodName: "get_principal",
    arg: IDL.encode([IDL.Opt(IDL.Text)], [[]]),
  }
  const request: any = await getTransformedRequest(
    identity,
    defineCanisterId(chain),
    fields,
  )
  const body = Cbor.encode(request.body)
  return {
    cbor: toHexString(body),
    chain,
  }
}
