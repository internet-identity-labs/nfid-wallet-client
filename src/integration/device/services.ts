import { fetchWebAuthnCapability, getIsMobileDeviceMatch } from "."

export async function isMobileWithWebAuthn() {
  console.debug("isMobileWithWebAuthn call fetchWebAuthnCapability")
  const hasWebAuthn = await fetchWebAuthnCapability()
  console.debug("isMobileWithWebAuthn", {
    hasWebAuthn,
  })
  if (!(hasWebAuthn && getIsMobileDeviceMatch())) throw new Error()
  return hasWebAuthn
}
