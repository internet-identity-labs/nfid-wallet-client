import { fetchWebAuthnCapabilitySync, isMobile } from "."

export function isMobileWithWebAuthn() {
  const hasWebAuthn = fetchWebAuthnCapabilitySync()
  if (hasWebAuthn === undefined)
    throw new Error("Cannot call fetch web authn sync too early")
  return hasWebAuthn && isMobile
}
