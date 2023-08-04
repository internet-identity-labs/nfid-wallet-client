import posthog from "posthog-js"

class LandingPageTracking {
  pageLoaded() {
    const title = "Landing page loaded"
    console.debug("LandingPageTracking.pageLoaded", { title })
    posthog.capture(title)
  }
}

export const landingPageTracking = new LandingPageTracking()
