import posthog from "posthog-js"

type PasskeyAdded = {
  authenticatorAttachment: AuthenticatorAttachment
  transports: AuthenticatorTransport[]
  userPresent: boolean
  userVerified: boolean
  backupEligibility: boolean
  backupState: boolean
  name: string
}

export class SecurityTracking {
  addPasskey() {
    posthog.capture("Add passkey modal opened")
  }
  passkeyCreationInitiated(isMultiDevice: boolean) {
    console.debug("passkeyCreationInitiated", { isMultiDevice })
    posthog.capture("Passkey creation initiated", { isMultiDevice })
  }
  passkeyAdded(data: PasskeyAdded) {
    console.debug("SecurityTracking.passkeyAdded", { data })
    posthog.capture("Passkey added", data)
  }
}

export const securityTracking = new SecurityTracking()
