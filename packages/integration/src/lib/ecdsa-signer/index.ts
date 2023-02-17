import { ecdsaSigner as ecdsaAPI } from "../actors"
import { hasOwnProperty } from "../test-utils"

export async function getEcdsaPublicKey(): Promise<Array<number>> {
  // FIXME:
  // call with the nfid.one delegation identity!
  const publicKeyResult = await ecdsaAPI.public_key().catch((e) => {
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
  // FIXME:
  // call with the nfid.one delegation identity!
  const signatureResult = await ecdsaAPI.sign(message).catch((e) => {
    throw new Error(`signEcdsaMessage: ${e.message}`)
  })
  if (hasOwnProperty(signatureResult, "Err")) {
    throw new Error(`signEcdsaMessage: ${signatureResult.Err}`)
  }
  return signatureResult.Ok.signature
}

export async function prepareSignature(
  message: Array<number>,
): Promise<string> {
  return await ecdsaAPI.prepare_signature(message).catch((e) => {
    throw new Error(`prepareSignature: ${e.message}`)
  })
}

export async function getSignature(hash: string): Promise<Array<number>> {
  const signatureResult = await ecdsaAPI.get_signature(hash).catch((e) => {
    throw new Error(`getSignature: ${e.message}`)
  })
  if (hasOwnProperty(signatureResult, "Err")) {
    throw new Error(`getSignature: ${signatureResult.Err}`)
  }
  return signatureResult.Ok.signature
}

export * from "./ecdsa-wallet"
