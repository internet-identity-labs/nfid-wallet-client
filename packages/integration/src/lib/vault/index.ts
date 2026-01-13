import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { hexStringToUint8Array, uint8ArrayToHexString } from "@dfinity/utils"

import {
  PolicyRegisterRequest,
  ThresholdPolicy as ThresholdPolicyRequest,
  VaultMemberRequest,
  VaultRegisterRequest,
  WalletRegisterRequest,
} from "../_ic_api/vault.d"
import { ii, vault as vaultAPI, vaultAnonymous } from "../actors"
import { authState } from "../authentication"
import { GLOBAL_ORIGIN } from "../delegation-factory/delegation-i"
import { RootWallet } from "../identity-manager/profile"

import {
  candidToPolicy,
  candidToTransaction,
  candidToVault,
  candidToWallet,
  objectStateToCandid,
  policyToCandid,
  roleToCandid,
  transactionStateToCandid,
  walletToCandid,
} from "./mapper"
import {
  Currency,
  ObjectState,
  Policy,
  PolicyType,
  Transaction,
  TransactionState,
  Vault,
  VaultRole,
  Wallet,
} from "./types"

export async function registerVault(
  vaultName: string,
  description: string | undefined,
): Promise<Vault> {
  const request: VaultRegisterRequest = {
    description: typeof description === "undefined" ? [] : [description],
    name: vaultName,
  }
  const vaultResponse = await vaultAPI.register_vault(request).catch((e) => {
    throw new Error(`registerVault: ${e.message}`)
  })
  return candidToVault(vaultResponse)
}

export async function getVaults(): Promise<Vault[]> {
  const userProfileData = authState.getUserIdData()
  let publicKey
  if (userProfileData.wallet === RootWallet.II) {
    publicKey = await fetchIIPrincipal(
      Number(userProfileData.anchor),
      GLOBAL_ORIGIN,
    ).then((pr) => pr.toText())
  } else {
    publicKey = userProfileData.publicKey
  }
  const hex = uint8ArrayToHexString(new Uint8Array(Array(32).fill(1)))
  const address = getAddress(Principal.fromText(publicKey), hex)
  const response = await vaultAnonymous
    .get_vaults_by_address(address)
    .catch((e) => {
      throw new Error(`getVaults: ${e.message}`)
    })
  return response.map((v) => candidToVault(v))
}

interface AddMemberToVaultOptions {
  vaultId: bigint
  memberAddress: string
  name: string
  role: VaultRole
  state: ObjectState
}

export async function storeMember({
  vaultId,
  memberAddress,
  name,
  role,
  state,
}: AddMemberToVaultOptions): Promise<Vault> {
  const vaultMemberRequest: VaultMemberRequest = {
    state: objectStateToCandid(state),
    address: memberAddress,
    name: [name],
    role: roleToCandid(role),
    vault_id: vaultId,
  }
  const response = await vaultAPI
    .store_member(vaultMemberRequest)
    .catch((e) => {
      throw new Error(`storeMember: ${e.message}`)
    })
  return candidToVault(response)
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
  const response = await vaultAPI
    .register_wallet(walletRegisterRequest)
    .catch((e) => {
      throw new Error(`registerWallet: ${e.message}`)
    })
  return candidToWallet(response)
}

export async function updateWallet(wallet: Wallet): Promise<Wallet> {
  const response = await vaultAPI
    .update_wallet(walletToCandid(wallet))
    .catch((e) => {
      throw new Error(`updateWallet: ${e.message}`)
    })
  return candidToWallet(response)
}

interface AddPolicyOptions {
  vaultId: bigint
  type: PolicyType
  amountThreshold: bigint
  currency: Currency
  memberThreshold: number
  wallets: Array<string> | undefined
}

export async function registerPolicy({
  vaultId,
  amountThreshold,
  memberThreshold,
  wallets,
}: AddPolicyOptions): Promise<Policy> {
  const tp: ThresholdPolicyRequest = {
    amount_threshold: amountThreshold,
    currency: { ICP: null },
    member_threshold: memberThreshold === undefined ? [] : [memberThreshold],
    wallets: wallets === undefined ? [] : [wallets],
  }
  const policyRegisterRequest: PolicyRegisterRequest = {
    policy_type: { threshold_policy: tp },
    vault_id: vaultId,
  }
  const response = await vaultAPI
    .register_policy(policyRegisterRequest)
    .catch((e) => {
      throw new Error(`registerPolicy: ${e.message}`)
    })
  return candidToPolicy(response)
}

export async function updatePolicy(policy: Policy): Promise<Policy> {
  const response = await vaultAPI
    .update_policy(policyToCandid(policy))
    .catch((e) => {
      throw new Error(`updatePolicy: ${e.message}`)
    })
  return candidToPolicy(response)
}

export async function getWallets(vaultId: bigint): Promise<Wallet[]> {
  const response = await vaultAPI.get_wallets(vaultId).catch((e) => {
    throw new Error(`getWallets: ${e.message}`)
  })
  return response.map((v) => candidToWallet(v))
}

export async function getPolicies(vaultId: bigint): Promise<Policy[]> {
  const response = await vaultAPI.get_policies(vaultId).catch((e) => {
    throw new Error(`getPolicies: ${e.message}`)
  })
  return response.map((v) => candidToPolicy(v))
}

export interface TransactionRegisterOptions {
  address: string
  amount: bigint
  from_sub_account: string
}

export async function registerTransaction({
  address,
  amount,
  from_sub_account,
}: TransactionRegisterOptions): Promise<Transaction> {
  const transaction = await vaultAPI
    .register_transaction({
      address,
      amount,
      wallet_id: from_sub_account,
    })
    .catch((e) => {
      throw new Error(`registerTransaction: ${e.message}`)
    })
  return candidToTransaction(transaction)
}

export interface TransactionApproveOptions {
  transactionId: bigint
  state: TransactionState
}

export async function approveTransaction({
  transactionId,
  state,
}: TransactionApproveOptions): Promise<Transaction> {
  const transaction = await vaultAPI
    .approve_transaction({
      state: transactionStateToCandid(state),
      transaction_id: transactionId,
    })
    .catch((e) => {
      throw new Error(`approveTransaction: ${e.message}`)
    })
  return candidToTransaction(transaction)
}

export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await vaultAPI.get_transactions().catch((e) => {
    throw new Error(`getTransactions: ${e.message}`)
  })
  return transactions.map(candidToTransaction)
}

export function getAddress(principal: Principal, subAccountHex: string) {
  const subAccount = SubAccount.fromBytes(hexStringToUint8Array(subAccountHex))
  if (subAccount instanceof Error) {
    throw subAccount
  }
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal,
    subAccount,
  })
  return accountIdentifier.toHex()
}

function fetchIIPrincipal(anchor: number, scope: string) {
  return ii.get_principal(BigInt(anchor), scope)
}
