import { SignedDelegation } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { PublicKey } from "../_ic_api/internet_identity.d"

// export interface SignedDelegation {
//   delegation: {
//     expiration: bigint
//     pubkey: PublicKey
//     targets: Principal[] | undefined
//   }
//   signature: Array<number>
// }

/**
 * An auth session, signed by the private keys in II, delegating signing authority for a
 * given anchor for a specific scope (i.e. a string combining persona and host) to the
 * session keys which the client has generated and provided to the identity provider.
 */
export interface ThirdPartyAuthSession {
  scope: string
  anchor: number
  signedDelegation: SignedDelegation
  userPublicKey: Uint8Array
}
