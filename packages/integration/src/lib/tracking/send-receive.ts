import posthog from "posthog-js"

type SendToken = {
  network: string
  destinationType: "address" | "ENS"
  tokenName: string
  tokenType: "fungible" | "non-fungible"
  tokenStandard: string
  amount: string | number
  fee: string | number
  // amount: bigint
  // fee: bigint
}

const mapTokenStandard = (tokenStandard: string) => {
  const nativeTokens = ["ICP", "ETH", "MATIC", "BTC"]
  return nativeTokens.includes(tokenStandard) ? "native" : tokenStandard
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

  sendToken({ tokenStandard, ...data }: SendToken) {
    const title = this.isOpenedFromVaults ? "Vault send token" : "Send token"

    console.debug("SendReceiveTracking.sendToken", { title, data })
    posthog.capture(title, {
      tokenStandard: mapTokenStandard(tokenStandard),
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
