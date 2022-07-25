import { fetchWebAuthnCapability, getIsMobileDeviceMatch } from "."

export async function isMobileWithWebAuthn() {
  console.debug("isMobileWithWebAuthn call fetchWebAuthnCapability")
  return (await fetchWebAuthnCapability()) && getIsMobileDeviceMatch()
}

// NOTE: Maybe this should live somewhere else?
export async function registerDeviceWithWebAuthn() {
  throw new Error("Not implemented")
}

// NOTE: Maybe this should live somewhere else?
export async function registerDeviceWithSecurityKey() {
  throw new Error("Not implemented")
}
