import { Vault } from "../_ic_api/vault.d"
import { vault as vaultAPI } from "../actors"

export async function registerVault(vaultName: string): Promise<Vault> {
  return vaultAPI.register_vault(vaultName)
}

export async function getVaults(): Promise<Vault[]> {
  return vaultAPI.get_vaults()
}
