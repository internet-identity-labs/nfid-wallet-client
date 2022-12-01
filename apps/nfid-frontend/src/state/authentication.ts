import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"

/**
 * An authentication session can be used to sign messages to II and NFID, and therefor
 * be thought of as an "NFID session". It is created by signing a key pair from a device
 * that is authorized on behalf of a given anchor by II.
 *
 * The sign identity is the device key pair, which will become the root of the delegation
 * chain in the delegation identity. This gives the session key pair authority to sign
 * on behalf of the device key pair via the delegation chain.
 *
 * The delegation identity is a delegation chain that links your biometric device key pair
 * (stored deep in the browser) to your session key pair (a generated Ed25519 key pair).
 */
export interface AbstractAuthSession {
  // Note: how do we transport these identities?
  anchor?: number
  identity: SignIdentity
  delegationIdentity: DelegationIdentity
}

export interface GoogleAuthSession extends AbstractAuthSession {
  sessionSource: "google"
}

export interface RemoteDeviceAuthSession extends AbstractAuthSession {
  sessionSource: "remoteDevice"
}

export interface LocalDeviceAuthSession extends AbstractAuthSession {
  sessionSource: "localDevice"
}

export interface IIAuthSession extends AbstractAuthSession {
  sessionSource: "ii"
}
export interface MetamaskAuthSession extends AbstractAuthSession {
  sessionSource: "metamask"
}

export type AuthSession =
  | GoogleAuthSession
  | RemoteDeviceAuthSession
  | LocalDeviceAuthSession
  | IIAuthSession
  | MetamaskAuthSession
