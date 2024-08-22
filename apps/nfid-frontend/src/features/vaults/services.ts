import { getVaults } from "@nfid/integration"

/**
 * @params vaultId: string
 * @returns vault by id
 */
export const getVaultById = async (id: string) => {
  const vaults = await getVaults()

  return vaults.find((vault) => vault.id === BigInt(id))
}

export const getAllVaults = async () => {
  return await getVaults()
}
