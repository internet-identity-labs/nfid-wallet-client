import { VaultMemberRequest, VaultRegisterRequest } from "../_ic_api/vault.d"
import { vault as vaultAPI } from "../actors"
import { Vault, VaultMember, VaultRole } from "./types"
import { responseToMember, responseToVault, roleToRequest } from "./mapper"

export async function registerVault(vaultName: string): Promise<Vault> {
  const request: VaultRegisterRequest = {
    name: vaultName,
  }
  const vaultResponse = await vaultAPI.register_vault(request)
  return responseToVault(vaultResponse)
}

export async function getVaults(): Promise<Vault[]> {
  const response = await vaultAPI.get_vaults()
  return response.map(v => responseToVault(v))
}

export async function addMemberToVault(vaultId: bigint, memberAddress: string, name: string, role: VaultRole): Promise<Vault> {
  const vaultMemberRequest: VaultMemberRequest = {
    address: memberAddress,
    name: [name],
    role: roleToRequest(role),
    vault_id: vaultId,
  }
  const response = await vaultAPI.add_vault_member(vaultMemberRequest)
  return responseToVault(response)
}

export async function getVaultMembers(vaultId: bigint): Promise<VaultMember[]> {
  const response = await vaultAPI.get_vault_members(vaultId)
  return response.map(v => responseToMember(v))
}
