import { HttpAgent } from "@dfinity/agent"
import "@dfinity/identity"

export const ic = {
  host: IC_HOST || "https://ic0.app",
  // NOTE: not sure if this is the right envar for islocal
  isLocal: II_MODE === "development",
  isDev: IS_DEV,
}

////////////
// Agent //
//////////

/** We share the same agent across all actors, and replace the identity when identity connection events occur. */
export const agent = HttpAgent.createSync({ host: ic.host, retryTimes: 10 })

/**
 * Retrieve the current principal.
 */
export async function fetchPrincipal() {
  const principal = await agent.getPrincipal()
  return principal
}

// When working locally (or !mainnet) we need to retrieve the root key of the replica.
if (ic.isLocal) agent.fetchRootKey()
