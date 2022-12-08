import {
  PolicyRegisterRequest,
  ThresholdPolicy as ThresholdPolicyRequest,
  VaultMemberRequest,
  VaultRegisterRequest,
  WalletRegisterRequest,
} from "../_ic_api/vault.d"
import { vault, vault as vaultAPI } from "../actors"
import {
  responseToMember,
  responseToPolicy,
  responseToTransaction,
  responseToVault,
  responseToWallet,
  roleToRequest,
} from "./mapper"
import {
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
}: AddMemberToVaultOptions): Promise<Vault> {
  //TODO Promise<VaultMember[]>
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
  const walletRegisterRequest: WalletRegisterRequest = {
    name: [name],
    vault_id: vaultId,
  }
  const response = await vaultAPI.register_wallet(walletRegisterRequest)
  return responseToWallet(response)
}

interface AddPolicyOptions {
  vaultId: bigint
  type: PolicyType
  amountThreshold: bigint
  currency: Currency
  memberThreshold: number
  walletIds: Array<bigint> | undefined
}

export async function registerPolicy({
  vaultId,
  amountThreshold,
  memberThreshold,
  walletIds,
}: AddPolicyOptions): Promise<Policy> {
  const tp: ThresholdPolicyRequest = {
    amount_threshold: amountThreshold,
    currency: { ICP: null },
    member_threshold: memberThreshold,
    wallet_ids: walletIds === undefined ? [] : [walletIds],
  }
  const policyRegisterRequest: PolicyRegisterRequest = {
    policy_type: { threshold_policy: tp },
    vault_id: vaultId,
  }
  const response = await vaultAPI.register_policy(policyRegisterRequest)
  return responseToPolicy(response)
}

export async function getWallets(vaultId: bigint): Promise<VaultMember[]> {
  const response = await vaultAPI.get_vault_members(vaultId)
  return response.map((v) => responseToMember(v))
}

export async function getPolicies(vaultId: bigint): Promise<Policy[]> {
  const response = await vaultAPI.get_policies(vaultId)
  return response.map((v) => responseToPolicy(v))
}

export async function walletAddress(walletId: bigint): Promise<string> {
  return await vault.sub(walletId) //todo move algorithm from rust
}

export interface TransactionRegisterOptions {
  address: string
  amount: bigint
  walletId: bigint
}

export async function registerTransaction({
  address,
  amount,
  walletId,
}: TransactionRegisterOptions): Promise<Transaction> {
  const transaction = await vaultAPI.register_transaction({
    address,
    amount,
    wallet_id: walletId,
  })
  return responseToTransaction(transaction)
}

export interface TransactionApproveOptions {
  transactionId: bigint
  state: State
}

export async function approveTransaction({
  transactionId,
  state,
}: TransactionApproveOptions): Promise<Transaction> {
  const transaction = await vaultAPI.approve_transaction({
    state: { APPROVED: null }, //TODO
    transaction_id: transactionId,
  })
  return responseToTransaction(transaction)
}

export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await vaultAPI.get_transactions()
  return transactions.map(responseToTransaction)
}
