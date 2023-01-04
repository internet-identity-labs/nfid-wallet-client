import { principalToAddress } from "ictool"

import { authState } from "@nfid/integration"

/**
 * Generate member address
 * @returns address string
 */
export const getMemberAddress = () => {
  const identity = authState.get().identity
  if (!identity) return ""
  return principalToAddress(identity.getPrincipal(), Array(32).fill(1))
}
