import { fetchWebAuthnCapability, isMobile } from "."

export async function isMobileWithWebAuthn() {
  const hasWebAuthn = await fetchWebAuthnCapability()
  if (!(hasWebAuthn && isMobile)) throw new Error()
  return hasWebAuthn
}
