import posthog from "posthog-js"

export class SecurityTracking {
  addPasskey() {
    posthog.capture("Add passkey modal opened")
  }
}

export const securityTracking = new SecurityTracking()
