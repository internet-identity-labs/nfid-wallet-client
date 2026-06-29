import { Principal } from "@icp-sdk/core/principal"
import base64url from "base64url"
import { DeviceData } from "packages/integration/src/lib/_ic_api/internet_identity.d"

import { DeviceType, Icon } from "@nfid/integration"

import { AccessPointResponse } from "frontend/integration/_ic_api/identity_manager.d"

import { IDevice } from "./types"
import { validateMnemonic } from "bip39"

export const mapIIDevicesToIDevices = (devices: DeviceData[]): IDevice[] => {
  return devices.map((d) => ({
    type:
      "authentication" in d.purpose ? DeviceType.Passkey : DeviceType.Recovery,
    label: d.alias,
    icon: "recovery" in d.purpose ? Icon.document : Icon.unknown,
    created_at: "",
    last_used: "",
    isMultiDevice: false,
    isLegacyDevice: true,
    principal: Principal.selfAuthenticating(new Uint8Array(d.pubkey)).toText(),
    credentialId: d.credential_id[0]
      ? base64url.encode(Buffer.from(d.credential_id[0]))
      : "",
    credentialIdBuffer: d.credential_id[0],
    publickey: d.pubkey,
  }))
}

export const mapIMDevicesToIDevices = (
  devices: AccessPointResponse[],
): IDevice[] => {
  return devices.map((d) => ({
    type:
      d.device === "Recovery phrase"
        ? DeviceType.Recovery
        : (Object.keys(d.device_type)[0] as DeviceType),
    label: d.device,
    icon: d.icon as Icon,
    created_at: "",
    last_used: String(d.last_used),
    isMultiDevice: false,
    isLegacyDevice: false,
    principal: d.principal_id,
    credentialId: d.credential_id[0] ?? "",
  }))
}

/**
 * Checks if the user is using Safari browser
 * @returns {boolean} - true if the browser is Safari, false otherwise
 */
function isSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  const isSafari = userAgent.includes("safari") && !userAgent.includes("chrome")
  return isSafari
}

export default isSafari

export function validateSeedPhrase(value: string): boolean {
  const parts = value.trim().toLowerCase().split(/\s+/)

  if (parts.length !== 25) {
    return false
  }

  const [anchor, ...mnemonicWords] = parts

  if (!/^\d+$/.test(anchor)) {
    return false
  }

  return validateMnemonic(mnemonicWords.join(" "))
}

export function validateEmailCode(value: string): boolean {
  return /^\d{6}$/.test(value)
}
