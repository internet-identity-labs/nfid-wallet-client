import { principalToAddress } from "ictool"

import { authState, getVaults } from "@nfid/integration"

/**
 * Generate member address
 * @returns address string
 */
export const getMemberAddress = () => {
  const identity = authState.get().identity
  if (!identity) return ""
  return principalToAddress(identity.getPrincipal(), Array(32).fill(1))
}

/**
 * @params vaultId: string
 * @returns vault by id
 */
export const getVaultById = async (id: string) => {
  const vaults = await getVaults()

  return vaults.find((vault) => vault.id === BigInt(id))
}
