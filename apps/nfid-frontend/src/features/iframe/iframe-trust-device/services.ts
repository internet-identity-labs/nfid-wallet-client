import { WebAuthnIdentity } from "@dfinity/identity"

import { ii, im, setProfile } from "@nfid/integration"

import { deviceInfo, getIcon } from "frontend/integration/device"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import { fetchProfile } from "frontend/integration/identity-manager"
import { fetchAuthenticatorDevices } from "frontend/integration/internet-identity"

declare const NFID_PROVIDER_URL: string

const handleTrustDevice = async (JSONIdentity: string, isWebAuthN: boolean) => {
  const profile = await fetchProfile()
  const identity = WebAuthnIdentity.fromJSON(JSONIdentity)

  try {
    const credential_id = Array.from(new Uint8Array(identity.rawId))
    await Promise.all([
      ii
        .add(BigInt(profile.anchor), {
          alias: deviceInfo.newDeviceName,
          pubkey: Array.from(new Uint8Array(identity.getPublicKey().toDer())),
          credential_id: [credential_id],
          key_type: isWebAuthN ? { platform: null } : { cross_platform: null },
          purpose: { authentication: null },
          protection: { unprotected: null },
        })
        .catch((e) => {
          throw new Error(`registerDeviceWithSecurityKey ii.add: ${e.message}`)
        }),
      im
        .create_access_point({
          icon: isWebAuthN ? getIcon(deviceInfo) : "usb",
          device: isWebAuthN ? deviceInfo.newDeviceName : "Security Key",
          browser: "",
          pub_key: identity.getPrincipal().toText(),
        })
        .catch((e) => {
          throw new Error(
            `registerDeviceWithSecurityKey im.create_access_point: ${e.message}`,
          )
        }),
    ])
  } catch (e: any) {
    console.error("registerDeviceWithSecurityKey", { message: e.message })
    if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)) {
      throw e
    }
    console.debug("registerDeviceWithSecurityKey", "device already registered")
  }
}

export const getIframeWebauthn = async () => {
  const profile = await fetchProfile()
  const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
    BigInt(profile.anchor),
  )

  const w = window.open(
    `${NFID_PROVIDER_URL}/iframe/trust-device`,
    "iframeTrust",
    `toolbar=0,location=0,menubar=0,width=390,height=490,
    left=${(window.screen.width - 390) / 2},
    top=${(window.screen.height - 490) / 2}`,
  )

  return new Promise((resolve) => {
    w?.addEventListener("message", async (e) => {
      if ("ready" in e?.data)
        return w?.postMessage({ devices: usersAuthenticatorDevices })

      if (!("isDeviceTrusted" in e?.data)) return

      if ("identity" in e?.data && "isWebAuthN" in e?.data) {
        await handleTrustDevice(e.data.identity, e?.data?.isWebAuthN)
      }

      if (e.data.isDeviceTrusted) setProfile(profile)

      resolve(false)
    })
  })
}
