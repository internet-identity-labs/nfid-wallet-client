import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"

/**
 * An authentication session can be used to sign messages to II and NFID, and therefor
 * be thought of as an "NFID session". It is created by signing a key pair from a device
 * that is authorized on behalf of a given anchor by II.
 *
 * The sign identity is: X
 *
 * The delegation identity is: Y
 */
export interface AbstractAuthSession {
  identity: SignIdentity
  delegationIdentity: DelegationIdentity
}

export interface GoogleAuthSession extends AbstractAuthSession {
  sessionSource: "google"
}

export interface RemoteDeviceAuthSession extends AbstractAuthSession {
  sessionSource: "remoteDevice"
  anchor: number
}

export interface LocalDeviceAuthSession extends AbstractAuthSession {
  sessionSource: "localDevice"
  anchor: number
}

export type AuthSession =
  | GoogleAuthSession
  | RemoteDeviceAuthSession
  | LocalDeviceAuthSession
