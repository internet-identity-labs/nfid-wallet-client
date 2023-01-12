import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk"
import { TAllEvents } from "@ramp-network/ramp-instant-sdk/dist/types/types"

declare const RAMP_WALLET_API_KEY: string
declare const RAMP_WALLET_SDK_URL: string

export type EmbeddedType = "embedded-desktop" | "embedded-mobile"

export function openRampWallet(
  address: string,
  element: HTMLElement,
  embeddedType: EmbeddedType,
  eventHandler: (event: TAllEvents) => any,
  eventType: TAllEvents["type"] | "*" = "*",
): void {
  new RampInstantSDK({
    url: RAMP_WALLET_SDK_URL,
    hostAppName: "NFID",
    hostLogoUrl: `${window.location.origin}/assets/application-icons/nfid.svg`,
    hostApiKey: RAMP_WALLET_API_KEY,
    userAddress: address,
    variant: embeddedType,
    containerNode: element,
  })
    .on(eventType, eventHandler)
    .show()
}
