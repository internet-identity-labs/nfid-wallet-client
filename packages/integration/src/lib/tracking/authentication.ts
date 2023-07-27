import posthog from "posthog-js"

type AuthSource =
  | "google"
  | "email"
  | "passkey - continue"
  | "passkey - legacy platform"
  | "passkey - legacy roaming"
  | "passkey - conditional"

type AuthTarget = "nfid" | string

type AuthData = {
  authLocation: "magic" | "main"
  authSource: AuthSource
  isNewUser: boolean
  authTarget: AuthTarget
  networkTarget: "ICP" | "ETH" | "MATIC" | "nfid"
  mainAccountOffered: boolean
  accountWillAutoSelect: boolean
  passkeyUsed: boolean
  authenticatorAttachment: ""
  transports: ""
  userPresent: boolean
  userVerified: boolean
  backupEligibility: boolean
  backupState: boolean
}

type AuthInitiatedEvent = {
  authSource: AuthSource
  authTarget: string
}

type AuthAbortedEvent = {
  authSource: AuthSource
  authTarget: string
}

class AuthenticationTracking {
  private data = {}

  public updateData(data: Partial<AuthData>) {
    this.data = {
      ...this.data,
      ...data,
    }
  }
  public initiated(event: AuthInitiatedEvent) {
    this.updateData(event)
    posthog.capture("Auth - initiated", this.data)
  }

  public aborted(event: AuthAbortedEvent) {
    this.updateData(event)
    posthog.capture("Auth - aborted", this.data)
  }

  public completed(event: AuthAbortedEvent) {
    this.updateData(event)
    posthog.capture("Auth - completed", this.data)
  }

  public failed() {
    posthog.capture("Auth - 2fa failed", this.data)
  }
}

export const authenticationTracking = new AuthenticationTracking()
