import { Actor } from "@dfinity/agent"

import { ecdsaSigner, ecdsaSigner as ecdsaAPI } from "../actors"
import { hasOwnProperty } from "../test-utils"

export * from "./delegation-adapter"
export * from "./ecdsa-wallet"
export * from "./types"

export async function getEcdsaPublicKey(): Promise<Array<number>> {
  const publicKeyResult = await ecdsaSigner.public_key().catch((e) => {
    throw new Error(`getEcdsaPublicKey: ${e.message}`)
  })
  if (hasOwnProperty(publicKeyResult, "Err")) {
    throw new Error(`getEcdsaPublicKey: ${publicKeyResult.Err}`)
  }
  return publicKeyResult.Ok.public_key
}

export async function signEcdsaMessage(
  message: Array<number>,
): Promise<Array<number>> {
  console.time("signEcdsaMessage")
  const signatureResult = await ecdsaAPI.sign(message).catch((e) => {
    throw new Error(`signEcdsaMessage: ${e.message}`)
  })
  if (hasOwnProperty(signatureResult, "Err")) {
    throw new Error(`signEcdsaMessage: ${signatureResult.Err}`)
  }
  console.timeEnd("signEcdsaMessage")
  return signatureResult.Ok.signature
}

export async function prepareSignature(
  message: Array<number>,
): Promise<string> {
  const principal = await Actor.agentOf(ecdsaAPI)?.getPrincipal()
  console.debug("prepareSignature", { principalId: principal?.toString() })

  return await ecdsaAPI.prepare_signature(message).catch((e) => {
    throw new Error(`prepareSignature: ${e.message}`)
  })
}

export async function getSignature(hash: string): Promise<Array<number>> {
  const principal = await Actor.agentOf(ecdsaAPI)?.getPrincipal()

  console.debug("getSignature", { principalId: principal?.toString() })
  const signatureResult = await ecdsaAPI.get_signature(hash).catch((e) => {
    throw new Error(`getSignature: ${e.message}`)
  })
  if (hasOwnProperty(signatureResult, "Err")) {
    throw new Error(`getSignature: ${signatureResult.Err}`)
  }
  return signatureResult.Ok.signature
}
