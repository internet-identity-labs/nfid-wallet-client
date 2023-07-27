import posthog from "posthog-js"

export class SecurityTracking {
  addPasskey() {
    posthog.capture("Add passkey modal opened")
  }
  passkeyCreationInitiated(isMultiDevice: boolean) {
    posthog.capture("Passkey creation initiated", { isMultiDevice })
  }
}

export const securityTracking = new SecurityTracking()
