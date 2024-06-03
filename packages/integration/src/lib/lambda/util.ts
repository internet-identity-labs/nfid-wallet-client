import { Ed25519KeyIdentity } from "@dfinity/identity"
import { createCipheriv, createDecipheriv, Encoding } from "crypto"

const DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS = 5 * 60 * 1000
const LAMBDA_IDENTITY = process.env["LAMBDA_IDENTITY"]

export const getIdentity = (seed: string): Ed25519KeyIdentity => {
  const seedEncoded: Uint8Array = new TextEncoder().encode(seed)
  return Ed25519KeyIdentity.generate(seedEncoded)
}

export function encrypt(value: string, encoding: Encoding, key: string) {
  //TODO maybe migrate to ccm/gcm
  const secretBuffer = Buffer.from(key, "hex")
  const cipher = createCipheriv("aes-256-ecb", secretBuffer, "")
  let cipherText = cipher.update(value, encoding, "hex")
  cipherText += cipher.final("hex")
  return cipherText
}

export function decrypt(encrypted: string, encoding: Encoding, key: string) {
  const secretBuffer = Buffer.from(key, "hex")
  const cipher = createDecipheriv("aes-256-ecb", secretBuffer, "")
  let decryptedString = cipher.update(encrypted, "hex", encoding)
  decryptedString += cipher.final(encoding)
  return decryptedString
}
