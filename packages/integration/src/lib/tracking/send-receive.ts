import posthog from "posthog-js"

type SendToken = {
  network: string
  destinationType: "address" | "ENS"
  tokenName: string
  tokenType: "fungible" | "non-fungible"
  tokenStandard: string
  amount: string | number
  fee: string
}

class SendReceiveTracking {
  openModal({ isSending = true } = {}) {
    const title = `${isSending ? "Send" : "Receive"} tokens modal opened`
    console.debug("SendReceiveTracking.openModal", { title })
    posthog.capture(title)
  }

  sendToken(data: SendToken) {
    const title = "Send token"
    console.debug("SendReceiveTracking.sendToken", { title, data })
    posthog.capture(title, data)
  }
}

export const sendReceiveTracking = new SendReceiveTracking()
