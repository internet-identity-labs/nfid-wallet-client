import { WebAuthnIdentity } from "@dfinity/identity"

import { setProfileToStorage } from "@nfid/integration"

import { addDeviceToIIandIM } from "frontend/integration/device/services"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import { fetchProfile } from "frontend/integration/identity-manager"
import { fetchAuthenticatorDevices } from "frontend/integration/internet-identity"

const handleTrustDevice = async (JSONIdentity: string, isWebAuthN: boolean) => {
  const profile = await fetchProfile()
  const identity = WebAuthnIdentity.fromJSON(JSONIdentity)

  try {
    await addDeviceToIIandIM(identity, BigInt(profile.anchor), !isWebAuthN)
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
    `toolbar=0,location=0,menubar=0,width=390,height=500,
    left=${(window.screen.width - 390) / 2},
    top=${(window.screen.height - 490) / 2}`,
  )

  if (!w) return

  return new Promise((resolve) => {
    w?.addEventListener("message", async (e) => {
      if (!e?.data) return
      if ("ready" in e.data)
        return w?.postMessage({ devices: usersAuthenticatorDevices })

      if (!("isDeviceTrusted" in e?.data)) return

      if ("identity" in e?.data && "isWebAuthN" in e?.data) {
        await handleTrustDevice(e.data.identity, e?.data?.isWebAuthN)
      }

      if (e.data.isDeviceTrusted) await setProfileToStorage(profile)

      resolve(false)
    })
  })
}
