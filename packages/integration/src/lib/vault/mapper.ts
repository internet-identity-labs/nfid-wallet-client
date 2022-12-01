import {
  Vault as VaultResponse,
  Wallet as WalletResponse,
  VaultMember as VaultMemberResponse,
  VaultRole as VaultRoleTransport,
} from "../_ic_api/vault.d"
import { hasOwnProperty } from "../test-utils"
import { Vault, VaultMember, VaultRole, Wallet } from "./types"

export function responseToVault(response: VaultResponse): Vault {
  return {
    id: response.id,
    members: response.members.map((m) => responseToMember(m)),
    name: response.name,
    policies: response.policies,
    wallets: response.wallets,
  }
}

export function responseToWallet(response: WalletResponse): Wallet {
  return {
    vaults: response.vaults,
    id: response.id,
    name: response.name.length === 0 ? undefined : response.name[0]
  }
}

export function responseToMember(response: VaultMemberResponse): VaultMember {
  return {
    name: response.name.length === 0 ? undefined : response.name[0],
    role: responseToRole(response.role),
    userId: response.user_uuid,
  }
}

function responseToRole(response: VaultRoleTransport): VaultRole {
  if (hasOwnProperty(response, "Admin")) {
    return VaultRole.Admin
  }
  if (hasOwnProperty(response, "Member")) {
    return VaultRole.Member
  }
  throw Error("Unexpected enum value")
}

export function roleToRequest(response: VaultRole): VaultRoleTransport {
  if (response === VaultRole.Admin) {
    return { Admin: null } as VaultRoleTransport
  }
  if (response === VaultRole.Member) {
    return { Member: null } as VaultRoleTransport
  }
  throw Error("Unexpected enum value")
}
