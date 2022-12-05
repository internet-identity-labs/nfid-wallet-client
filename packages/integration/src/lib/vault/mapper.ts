import {
  Policy as PolicyResponse,
  Vault as VaultResponse,
  VaultMember as VaultMemberResponse,
  VaultRole as VaultRoleTransport,
  Wallet as WalletResponse,
} from "../_ic_api/vault.d"
import { hasOwnProperty } from "../test-utils"
import {
  Currency,
  Policy,
  PolicyType,
  Vault,
  VaultMember,
  VaultRole,
  Wallet,
} from "./types"

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
    name: response.name.length === 0 ? undefined : response.name[0],
  }
}

export function responseToPolicy(response: PolicyResponse): Policy {
  if (hasOwnProperty(response.policy_type, "threshold_policy")) {
    const threshold = response.policy_type.threshold_policy
    return {
      amountThreshold: threshold.amount_threshold,
      currency: Currency.ICP,
      id: response.id,
      memberThreshold: threshold.member_threshold,
      type: PolicyType.ThresholdPolicy,
      walletIds:
        threshold.wallet_ids.length === 0 ? undefined : threshold.wallet_ids[0],
    }
  }
  throw Error("Unknown policy type")
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
