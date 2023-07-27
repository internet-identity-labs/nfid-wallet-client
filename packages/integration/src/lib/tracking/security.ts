import posthog from "posthog-js"

type PasskeyBase = {
  authenticatorAttachment: AuthenticatorAttachment
  transports: AuthenticatorTransport[]
  userPresent: boolean
  userVerified: boolean
  backupEligibility: boolean
  backupState: boolean
  name: string
}

type PasskeyRemoved =
  | (PasskeyBase & {
      legacy: false
    })
  | { legacy: true }

export class SecurityTracking {
  addPasskey() {
    posthog.capture("Add passkey modal opened")
  }
  passkeyCreationInitiated(isMultiDevice: boolean) {
    const title = "Passkey creation initiated"
    console.debug("passkeyCreationInitiated", {
      title,
      data: { isMultiDevice },
    })
    posthog.capture(title, { isMultiDevice })
  }
  passkeyAdded(data: PasskeyBase) {
    const title = "Passkey added"
    console.debug("SecurityTracking.passkeyAdded", { title, data })
    posthog.capture(title, data)
  }
  passkeyRemoved(data: PasskeyRemoved) {
    const title = "Passkey removed"
    console.debug("SecurityTracking.passkeyRemoved", { title, data })
    posthog.capture(title, data)
  }
}

export const securityTracking = new SecurityTracking()
