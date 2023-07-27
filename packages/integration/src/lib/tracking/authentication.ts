import posthog from "posthog-js"

import { authState } from "../authentication"

type AuthSource =
  | "google"
  | "email"
  | "passkey - continue"
  | "passkey - legacy platform"
  | "passkey - legacy roaming"
  | "passkey - conditional"

type AuthTarget = "nfid" | string

type AuthenticatorAttachment = "platform" | "cross-platform"

type AuthData = {
  authLocation: "magic" | "main"
  authSource: AuthSource
  isNewUser: boolean
  authTarget: AuthTarget
  networkTarget: "ICP" | "ETH" | "MATIC" | "nfid"
  mainAccountOffered: boolean
  accountWillAutoSelect: boolean
  passkeyUsed: boolean
  authenticatorAttachment: AuthenticatorAttachment
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

type UserData = {
  legacyUser: boolean
  hasEmail: boolean
  registrationSource?: AuthTarget
}

type AuthMagicLinkLoadedEvent = {
  emailVerified: boolean
  tokenExpired: boolean
  linkGoogle: boolean
}

type AuthMagicGoolgeLinkCompletedEvent = {
  googleEmailLinked: boolean
}

class AuthenticationTracking {
  private data: Partial<AuthData> = {}
  private userData = {}

  public updateData(data: Partial<AuthData>) {
    this.data = {
      ...this.data,
      ...data,
    }
  }

  public updateUserData(userData: UserData) {
    this.userData = {
      ...this.userData,
      ...userData,
    }
  }

  public identify(userData: UserData) {
    const delegationIdentity = authState.get().delegationIdentity
    if (!delegationIdentity) throw new Error("delegationIdentity is missing")

    console.debug("authenticationTracking.identify", { userData })
    posthog.identify(delegationIdentity.getPrincipal().toString(), userData)
  }

  public initiated(event: AuthInitiatedEvent) {
    console.debug("authenticationTracking.initiated", { event })
    this.updateData(event)
    posthog.capture("Auth - initiated", this.data)
  }

  public aborted(event: AuthAbortedEvent) {
    console.debug("authenticationTracking.aborted", { event })
    this.updateData(event)
    posthog.capture("Auth - aborted", this.data)
  }

  public completed(userData: UserData) {
    this.identify({
      ...userData,
      ...(this.data.isNewUser
        ? { registrationSource: this.data.authTarget }
        : {}),
    })
    console.debug("authenticationTracking.completed", { data: this.data })
    posthog.capture("Auth - completed", this.data)
  }

  public userSendToApp() {
    const data = {
      authSource: this.data.authSource,
      authTarget: this.data.authTarget,
      isNewUser: this.data.isNewUser,
      networkTarget: this.data.networkTarget,
    }
    const title = "User sent to app"
    console.debug("authenticationTracking.userSendToApp", { title, data })
    posthog.capture(title, data)
  }

  public failed() {
    console.debug("authenticationTracking.failed", { data: this.data })
    posthog.capture("Auth - 2fa failed", this.data)
  }

  public magicLinkLoaded(data: AuthMagicLinkLoadedEvent) {
    console.debug("authenticationTracking.magicLinkLoaded", { data })
    posthog.capture("Auth - magic link loaded", data)
  }

  public magicGoogleLinkInitiated() {
    posthog.capture("Auth - magic google link initiated")
  }

  public magicGoogleLinkCompleted(data: AuthMagicGoolgeLinkCompletedEvent) {
    console.debug("authenticationTracking.magicGoogleLinkCompleted", {
      data,
    })
    posthog.capture("Auth - magic google link completed", data)
  }
}

export const authenticationTracking = new AuthenticationTracking()
