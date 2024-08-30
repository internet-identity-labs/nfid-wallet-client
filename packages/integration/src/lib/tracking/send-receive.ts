import posthog from "posthog-js"

type SendToken = {
  destinationType: "address" | "ENS"
  tokenName: string
  tokenType: "fungible" | "non-fungible"
  amount: string | number
  fee: string | number
}

class SendReceiveTracking {
  isOpenedFromVaults = false

  openModal({ isSending = true, isOpenedFromVaults = false } = {}) {
    this.isOpenedFromVaults = isOpenedFromVaults

    const title = isSending
      ? isOpenedFromVaults
        ? "Vault send tokens modal opened"
        : "Send tokens modal opened"
      : isOpenedFromVaults
      ? "Vault receive tokens modal opened"
      : "Receive tokens modal opened"

    console.debug("SendReceiveTracking.openModal", { title })
    posthog.capture(title)
  }

  sendToken({ ...data }: SendToken) {
    const title = this.isOpenedFromVaults ? "Vault send token" : "Send token"

    console.debug("SendReceiveTracking.sendToken", { title, data })
    posthog.capture(title, {
      ...data,
    })
  }

  supportedTokenModalOpened() {
    const title = this.isOpenedFromVaults
      ? "Vault token support dialog opened"
      : "Token support dialog opened"
    console.debug("SendReceiveTracking.supportedTokenModalOpened", { title })
    posthog.capture(title)
  }
}

export const sendReceiveTracking = new SendReceiveTracking()
