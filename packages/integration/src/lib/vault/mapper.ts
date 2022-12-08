import {
  Policy as PolicyResponse,
  Transaction as TransactionResponse,
  Vault as VaultResponse,
  VaultMember as VaultMemberResponse,
  VaultRole as VaultRoleTransport,
  State as StateTransport,
  Wallet as WalletResponse,
  Approve as ApproveResponse,
} from "../_ic_api/vault.d"
import { hasOwnProperty } from "../test-utils"
import {
  Approve,
  Currency,
  Policy,
  PolicyType,
  State,
  Transaction,
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

export function responseToApprove(response: ApproveResponse): Approve {
  return {
    createdDate: response.created_date,
    signer: response.signer,
    status: responseToState(response.status),
  }
}

export function responseToTransaction(
  response: TransactionResponse,
): Transaction {
  return {
    amount: response.amount,
    amountThreshold: response.amount_threshold,
    approves: response.approves.map(responseToApprove),
    blockIndex:
      response.block_index.length === 0 ? undefined : response.block_index[0],
    createdDate: response.created_date,
    currency: Currency.ICP,
    id: response.id,
    memberThreshold: response.member_threshold,
    modifiedDate: response.modified_date,
    policyId: response.policy_id,
    state: responseToState(response.state),
    to: response.to,
    walletId: response.wallet_id,
    vaultId: response.vault_id,
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

function responseToState(response: StateTransport): State {
  if (hasOwnProperty(response, "APPROVED")) {
    return State.APPROVED
  }
  if (hasOwnProperty(response, "PENDING")) {
    return State.PENDING
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
