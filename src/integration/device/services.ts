import { fetchWebAuthnCapability, isMobile } from "."

export async function isMobileWithWebAuthn() {
  console.debug(">> isMobileWithWebAuthn")
  const hasWebAuthn = await fetchWebAuthnCapability()
  console.debug(">> isMobileWithWebAuthn", { hasWebAuthn, isMobile })
  if (!(hasWebAuthn && isMobile)) throw new Error()
  return hasWebAuthn
}
