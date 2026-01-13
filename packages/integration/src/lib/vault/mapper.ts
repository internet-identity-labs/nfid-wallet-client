import {
  Approve as ApproveCandid,
  ObjectState as ObjectStateCandid,
  Policy as PolicyCandid,
  Transaction as TransactionCandid,
  TransactionState as TransactionStateCandid,
  Vault as VaultCandid,
  VaultMember as VaultMemberCandid,
  VaultRole as VaultRoleCandid,
  Wallet as WalletCandid,
} from "../_ic_api/vault.d"
import { hasOwnProperty } from "../test-utils"

import {
  Approve,
  Currency,
  ObjectState,
  Policy,
  PolicyType,
  Transaction,
  TransactionState,
  Vault,
  VaultMember,
  VaultRole,
  Wallet,
} from "./types"

export function candidToVault(response: VaultCandid): Vault {
  return {
    createdDate: response.created_date,
    description:
      response.description.length === 0 ? undefined : response.description[0],
    modifiedDate: response.modified_date,
    id: response.id,
    members: response.members.map((m) => candidToMember(m)),
    name: response.name,
    policies: response.policies,
    wallets: response.wallets,
  }
}

export function candidToWallet(response: WalletCandid): Wallet {
  return {
    createdDate: response.created_date,
    modifiedDate: response.modified_date,
    state: candidToObjectState(response.state),
    vaults: response.vaults,
    uid: response.uid,
    name: response.name.length === 0 ? undefined : response.name[0],
  }
}

export function walletToCandid(wallet: Wallet): WalletCandid {
  return {
    created_date: wallet.createdDate,
    uid: wallet.uid,
    modified_date: wallet.modifiedDate,
    name: typeof wallet.name === undefined ? [] : [wallet.name as string],
    state: objectStateToCandid(wallet.state),
    vaults: wallet.vaults,
  }
}

export function policyToCandid(policy: Policy): PolicyCandid {
  return {
    created_date: policy.createdDate,
    id: policy.id,
    modified_date: policy.modifiedDate,
    policy_type: {
      threshold_policy: {
        amount_threshold: policy.amountThreshold,
        currency: { ICP: null },
        member_threshold:
          typeof policy.memberThreshold === "undefined"
            ? []
            : [policy.memberThreshold],
        wallets: typeof policy.wallets === "undefined" ? [] : [policy.wallets],
      },
    },
    state: objectStateToCandid(policy.state),
    vault: policy.vault,
  }
}

export function candidToPolicy(response: PolicyCandid): Policy {
  if (hasOwnProperty(response.policy_type, "threshold_policy")) {
    const threshold = response.policy_type.threshold_policy
    return {
      state: candidToObjectState(response.state),
      vault: response.vault,
      createdDate: response.created_date,
      modifiedDate: response.modified_date,
      amountThreshold: threshold.amount_threshold,
      currency: Currency.ICP,
      id: response.id,
      memberThreshold:
        threshold.member_threshold.length === 0
          ? undefined
          : threshold.member_threshold[0],
      type: PolicyType.THRESHOLD_POLICY,
      wallets:
        threshold.wallets.length === 0 ? undefined : threshold.wallets[0],
    }
  }
  throw Error("Unknown policy type")
}

export function candidToMember(response: VaultMemberCandid): VaultMember {
  return {
    state: candidToObjectState(response.state),
    name: response.name.length === 0 ? undefined : response.name[0],
    role: candidToRole(response.role),
    userId: response.user_uuid,
  }
}

export function candidToApprove(response: ApproveCandid): Approve {
  return {
    createdDate: response.created_date,
    signer: response.signer,
    status: candidToTransactionState(response.status),
  }
}

export function candidToTransaction(response: TransactionCandid): Transaction {
  return {
    owner: response.owner,
    amount: response.amount,
    amountThreshold: response.amount_threshold,
    approves: response.approves.map(candidToApprove),
    blockIndex:
      response.block_index.length === 0 ? undefined : response.block_index[0],
    createdDate: response.created_date,
    currency: Currency.ICP,
    id: response.id,
    memberThreshold: response.member_threshold,
    modifiedDate: response.modified_date,
    policyId: response.policy_id,
    state: candidToTransactionState(response.state),
    to: response.to,
    from_sub_account: response.from,
    vaultId: response.vault_id,
    memo: response.memo.length === 0 ? undefined : response.memo[0],
  }
}

function candidToRole(response: VaultRoleCandid): VaultRole {
  if (hasOwnProperty(response, "Admin")) {
    return VaultRole.ADMIN
  }
  if (hasOwnProperty(response, "Member")) {
    return VaultRole.MEMBER
  }
  throw Error("Unexpected enum value")
}

function candidToObjectState(response: ObjectStateCandid): ObjectState {
  if (hasOwnProperty(response, "Active")) {
    return ObjectState.ACTIVE
  }
  if (hasOwnProperty(response, "Archived")) {
    return ObjectState.ARCHIVED
  }
  throw Error("Unexpected enum value")
}

function candidToTransactionState(
  response: TransactionStateCandid,
): TransactionState {
  if (hasOwnProperty(response, "Approved")) {
    return TransactionState.APPROVED
  }
  if (hasOwnProperty(response, "Pending")) {
    return TransactionState.PENDING
  }
  if (hasOwnProperty(response, "Cancelled")) {
    return TransactionState.CANCELED
  }
  if (hasOwnProperty(response, "Rejected")) {
    return TransactionState.REJECTED
  }
  throw Error("Unexpected enum value")
}

export function transactionStateToCandid(
  state: TransactionState,
): TransactionStateCandid {
  if (state === TransactionState.APPROVED) {
    return { Approved: null }
  }
  if (state === TransactionState.REJECTED) {
    return { Rejected: null }
  }
  if (state === TransactionState.CANCELED) {
    return { Canceled: null }
  }
  if (state === TransactionState.PENDING) {
    return { Pending: null }
  }
  throw Error("Unexpected enum value")
}

export function objectStateToCandid(state: ObjectState): ObjectStateCandid {
  if (state === ObjectState.ACTIVE) {
    return { Active: null }
  }
  if (state === ObjectState.ARCHIVED) {
    return { Archived: null }
  }
  throw Error("Unexpected enum value")
}

export function roleToCandid(response: VaultRole): VaultRoleCandid {
  if (response === VaultRole.ADMIN) {
    return { Admin: null } as VaultRoleCandid
  }
  if (response === VaultRole.MEMBER) {
    return { Member: null } as VaultRoleCandid
  }
  throw Error("Unexpected enum value")
}
