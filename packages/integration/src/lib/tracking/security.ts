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
    posthog.capture("Add Passkey modal opened")
  }

  addPasskeyError(data?: { message: string }) {
    const title = "Add Passkey error"
    console.debug("SecurityTracking.addPasskeyError", { title, data })
    posthog.capture(title, data)
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

  toggle2FA(enabled: boolean) {
    const title = `2FA ${enabled ? "enabled" : "disabled"}`
    console.debug("SecurityTracking.toggle2FA", { title })
    posthog.capture(title)
  }

  recoveryPhraseAdded() {
    const title = "Recovery phrase added"
    console.debug("SecurityTracking.recoveryPhraseAdded", { title })
    posthog.capture(title)
  }

  recoveryPhraseRemoved() {
    const title = "Recovery phrase removed"
    console.debug("SecurityTracking.recoveryPhraseRemoved", { title })
    posthog.capture(title)
  }
}

export const securityTracking = new SecurityTracking()
