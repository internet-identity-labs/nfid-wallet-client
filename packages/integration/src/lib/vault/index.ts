import { VaultMemberRequest, VaultRegisterRequest, WalletRegisterRequest } from "../_ic_api/vault.d"
import { vault, vault as vaultAPI } from "../actors"
import { responseToMember, responseToVault, responseToWallet, roleToRequest } from "./mapper"
import { Vault, VaultMember, VaultRole, Wallet } from "./types"
import { principalToAddress } from "ictool"
import { Principal } from "@dfinity/principal"

declare const VAULT_CANISTER_ID: string

export async function registerVault(vaultName: string): Promise<Vault> {
  const request: VaultRegisterRequest = {
    name: vaultName,
  }
  const vaultResponse = await vaultAPI.register_vault(request)
  return responseToVault(vaultResponse)
}

export async function getVaults(): Promise<Vault[]> {
  const response = await vaultAPI.get_vaults()
  return response.map((v) => responseToVault(v))
}

interface AddMemberToVaultOptions {
  vaultId: bigint
  memberAddress: string
  name: string
  role: VaultRole
}

export async function addMemberToVault({
  vaultId,
  memberAddress,
  name,
  role,
}: AddMemberToVaultOptions): Promise<Vault> { //TODO Promise<VaultMember[]>
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
  return response.map((v) => responseToMember(v))
}

interface AddWalletOptions {
  vaultId: bigint
  name: string
}

export async function registerWallet({
 vaultId,
 name,
}: AddWalletOptions): Promise<Wallet> {
  const walletRegisterRequest: WalletRegisterRequest = { name: [name], vault_id: vaultId }
  const response = await vaultAPI.register_wallet(walletRegisterRequest)
  return responseToWallet(response)
}

export async function getWallets(vaultId: bigint): Promise<VaultMember[]> {
  const response = await vaultAPI.get_vault_members(vaultId)
  return response.map((v) => responseToMember(v))
}

export async function walletAddress(walletId: bigint): Promise<string> {
  return await vault.sub(walletId) //todo move algorithm from rust
}
