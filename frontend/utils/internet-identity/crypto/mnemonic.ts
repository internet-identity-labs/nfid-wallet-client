import { blobFromUint32Array } from "@dfinity/candid"
import { entropyToMnemonic, validateMnemonic } from "bip39"
import { ENGLISH_WORDS } from "./wordlist"

/**
 * @returns A random BIP39 mnemonic with 256 bits of entropy.
 */
export function generate(): string {
  const entropy = new Uint32Array(32)
  crypto.getRandomValues(entropy)
  return entropyToMnemonic(
    blobFromUint32Array(entropy).toString("hex"),
    ENGLISH_WORDS,
  )
}

/**
 * @returns true if the mnemonic is valid, false otherwise.
 */
export function validate(mnemonic: string): boolean {
  return validateMnemonic(mnemonic)
}
