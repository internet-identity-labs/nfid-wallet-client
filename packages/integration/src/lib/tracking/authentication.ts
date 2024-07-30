import posthog from "posthog-js"

import { authState } from "../authentication"

type AuthSource =
  | "google"
  | "email"
  | "passkey"
  | "passkey - continue"
  | "passkey - legacy platform"
  | "passkey - legacy roaming"
  | "passkey - conditional"

type AuthTarget = "nfid" | string

type AuthData = {
  accountWillAutoSelect: boolean
  authenticatorAttachment: AuthenticatorAttachment
  authLocation: "magic" | "main"
  authSource: AuthSource
  authTarget: AuthTarget
  backupEligibility: boolean
  backupState: boolean
  isNewUser: boolean
  legacyUser: boolean
  mainAccountOffered: boolean
  networkTarget: "ICP" | "nfid"
  passkeyUsed: boolean
  rootWallet: boolean
  transports: ""
  userPresent: boolean
  userVerified: boolean
}

type AuthAbortedEvent = {
  authSource: AuthSource
  authTarget?: string
}

type UserData = {
  anchor: number
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
    console.debug("authenticationTracking.updateData", {
      currentData: this.data,
      newData: data,
    })
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

  public authModalOpened(data: Partial<AuthData>) {
    const title = "Auth - modal opened"
    const event = {
      authTarget: data.authTarget || "nfid",
      mainAccountOffered: false,
      accountWillAutoSelect: false, // needs to be dynamic on new SDK flow
      networkTarget: data.networkTarget || "nfid",
      // isAuthenticated: false, // could be helpful to know if user is already authenticated
    }
    console.debug("authenticationTracking.authModalOpened", { title, event })

    this.updateData(event)
    posthog.capture(title, event)
  }

  public identify({ anchor, ...userData }: UserData) {
    console.debug("authenticationTracking.identify", { anchor, userData })

    posthog.identify(anchor.toString(), userData)
  }

  public initiated(event: Partial<AuthData>, is2FA = false) {
    this.updateData({
      ...event,
      authTarget: event.authTarget || this.data.authTarget || "nfid",
    })
    const title = is2FA ? "Auth - 2fa initiated" : "Auth - initiated"

    console.debug("authenticationTracking.initiated", {
      title,
      event,
      accumulatedData: this.data,
    })
    posthog.capture(title, this.data)
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
      networkTarget: this.data.networkTarget || "nfid",
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
  public magicLinkResendVerification() {
    const title = "Resend magic link email"
    console.debug("authenticationTracking.magicLinkResendVerification", {
      title,
    })
    posthog.capture(title)
  }

  public profileSelectionLoaded({
    privateProfilesCount,
  }: {
    privateProfilesCount: number
  }) {
    const title = "Profile selection loaded"
    const event = {
      ...this.data,
      privateProfiles: privateProfilesCount,
    }
    console.debug("authenticationTracking.profileSelectionLoaded", {
      title,
      event,
    })

    posthog.capture(title, event)
  }

  public profileChosen({ profile }: { profile: string }) {
    const title = "Profile chosen"
    const event = {
      ...this.data,
      profile,
    }
    console.debug("authenticationTracking.profileChosen", {
      title,
      event,
    })

    posthog.capture(title, event)
  }

  public loaded2fa() {
    console.debug("authenticationTracking.loaded2fa")
    posthog.capture("Auth - 2fa loaded", this.data)
  }
}

export const authenticationTracking = new AuthenticationTracking()
