import posthog from "posthog-js"

class SendReceiveTracking {
  openModal() {
    const title = "Send tokens modal opened"
    console.debug("SendReceiveTracking.openModal", { title })
    posthog.capture(title)
  }
}

export const sendReceiveTracking = new SendReceiveTracking()
