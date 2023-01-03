import { hasOwnProperty } from "src/integration/internet-identity/utils"

import { ecdsaSigner as ecdsaAPI } from "../actors"

export async function getEcdsaPublicKey(): Promise<Array<number>> {
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
  const signatureResult = await ecdsaAPI.sign(message).catch((e) => {
    throw new Error(`signEcdsaMessage: ${e.message}`)
  })
  if (hasOwnProperty(signatureResult, "Err")) {
    throw new Error(`signEcdsaMessage: ${signatureResult.Err}`)
  }
  return signatureResult.Ok.signature
}
