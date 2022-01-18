import type { Principal } from "@dfinity/principal"
export type Ciphertext = string
export type DeviceAlias = string
export type GetCiphertextError = { notSynced: null } | { notFound: null }
export interface KeySync {
  get_ciphertext: (arg_0: PublicKey) => Promise<Result>
  get_devices: () => Promise<Array<[DeviceAlias, PublicKey]>>
  get_unsynced_pubkeys: () => Promise<Array<PublicKey>>
  isSeeded: () => Promise<boolean>
  register_device: (arg_0: DeviceAlias, arg_1: PublicKey) => Promise<boolean>
  remove_device: (arg_0: DeviceAlias) => Promise<undefined>
  seed: (arg_0: PublicKey, arg_1: Ciphertext) => Promise<undefined>
  submit_ciphertexts: (
    arg_0: Array<[PublicKey, Ciphertext]>,
  ) => Promise<undefined>
  whoami: () => Promise<Principal>
}
export type PublicKey = string
export type Result = { ok: Ciphertext } | { err: GetCiphertextError }
export interface _SERVICE extends KeySync {}
