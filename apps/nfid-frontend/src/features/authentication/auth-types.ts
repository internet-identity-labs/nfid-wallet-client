import {
  AbstractAuthSession,
  AuthSession,
  GoogleAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

// Shared auth session types used across machines
export type SharedAuthSession = AuthSession | AbstractAuthSession
export type SharedGoogleAuthSession = GoogleAuthSession

// Shared auth request/meta shape passed into AuthenticationMachine
export interface SharedAuthRequest extends AuthorizationRequest {}

export interface SharedAuthorizingAppMeta extends AuthorizingAppMeta {}

// Common final data shapes used by sub-auth machines
export interface AuthWithEmailResult {
  authSession: AuthSession | AbstractAuthSession
}

export interface AuthWithGoogleResult {
  authSession: GoogleAuthSession
  isRegistered: boolean
}
