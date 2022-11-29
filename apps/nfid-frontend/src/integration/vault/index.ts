import { Vault } from "packages/integration/src/lib/_ic_api/vault.d"

import { vault as vaultAPI } from "@nfid/integration"

export async function registerVault(vaultName: string): Promise<Vault> {
  return vaultAPI.register_vault(vaultName)
}

export async function getVaults(): Promise<Vault[]> {
  return vaultAPI.get_vaults()
}
