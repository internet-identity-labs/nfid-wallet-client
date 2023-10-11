/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { fromHexString, principalToAddress } from "ictool"

import { replaceActorIdentity, vault } from "../actors"
import { generateDelegationIdentity } from "../test-utils"
import {
  approveTransaction,
  getPolicies,
  getTransactions,
  getVaults,
  getWallets,
  registerPolicy,
  registerTransaction,
  registerVault,
  registerWallet,
  storeMember,
  updatePolicy,
  updateWallet,
} from "./index"
import {
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

describe("Vault suite", () => {
  jest.setTimeout(100000)

  let vaultFirst: Vault
  const memberIdentity = Ed25519KeyIdentity.generate()
  const memberAddress = principalToAddress(
    //@ts-ignore
    memberIdentity.getPrincipal(),
    Array(32).fill(1),
  )

  let address: string
  it("vault register test", async () => {
    const mockedIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceActorIdentity(vault, delegationIdentity)

    vaultFirst = await registerVault("first", undefined)
    address = principalToAddress(
      mockedIdentity.getPrincipal() as any,
      Array(32).fill(1),
    )
    expect(vaultFirst).toEqual({
      createdDate: expect.any(BigInt),
      modifiedDate: expect.any(BigInt),
      id: expect.any(BigInt),
      name: "first",
      description: undefined,
      members: [
        {
          name: undefined,
          userId: address,
          role: VaultRole.ADMIN,
          state: ObjectState.ACTIVE,
        },
      ],
      policies: expect.any(BigUint64Array),
      wallets: expect.any(Array),
    })
  })
  it("get vaults test", async () => {
    const vaults = await getVaults()
    expect(vaults).toEqual([vaultFirst])
  })
  it("store member test", async () => {
    //STORE MEMBER AS ACTIVE
    await storeMember({
      state: ObjectState.ACTIVE,
      vaultId: vaultFirst.id,
      memberAddress,
      name: "Test Name",
      role: VaultRole.MEMBER,
    })
    const vaults = await getVaults()
    const members = vaults.find((v) => v.id === BigInt(vaultFirst.id))?.members
    expect(members?.length).toEqual(2)
    const member = members?.find(
      (l) => l.userId === memberAddress,
    ) as VaultMember
    expect(member).toEqual({
      state: ObjectState.ACTIVE,
      name: "Test Name",
      role: VaultRole.MEMBER,
      userId: memberAddress,
    })
  })
  it("restore member test", async () => {
    await storeMember({
      state: ObjectState.ARCHIVED,
      vaultId: vaultFirst.id,
      memberAddress: memberAddress,
      name: "Test Name2",
      role: VaultRole.MEMBER,
    })
    expect(
      await getVaults().then((v) =>
        v
          .find((v) => v.id === BigInt(vaultFirst.id))
          ?.members?.find((l) => l.userId === memberAddress),
      ),
    ).toEqual({
      state: ObjectState.ARCHIVED,
      name: "Test Name2",
      role: VaultRole.MEMBER,
      userId: memberAddress,
    })
  })
  let wallet: Wallet
  it("register member test", async () => {
    wallet = await registerWallet({
      name: "Wallet1",
      vaultId: vaultFirst.id,
    })
    expect(wallet).toEqual({
      createdDate: expect.any(BigInt),
      uid: expect.any(String),
      modifiedDate: expect.any(BigInt),
      name: "Wallet1",
      state: ObjectState.ACTIVE,
      vaults: expect.any(BigUint64Array),
    })
  })
  it("get wallets test", async () => {
    const wallets = await getWallets(vaultFirst.id)
    expect(wallets.length).toEqual(1)
  })
  it("update wallet test", async () => {
    wallet.name = "Updated"
    wallet.state = ObjectState.ARCHIVED
    const updated = await updateWallet(wallet)
    expect(updated).toEqual({
      createdDate: expect.any(BigInt),
      uid: expect.any(String),
      modifiedDate: expect.any(BigInt),
      name: "Updated",
      state: ObjectState.ARCHIVED,
      vaults: expect.any(BigUint64Array),
    })
  })

  let policy: Policy
  it("store policy test", async () => {
    policy = await registerPolicy({
      amountThreshold: BigInt(1),
      currency: Currency.ICP,
      memberThreshold: 5,
      type: PolicyType.THRESHOLD_POLICY,
      wallets: undefined,
      vaultId: vaultFirst.id,
    })
    expect(policy).toEqual({
      amountThreshold: BigInt(1),
      createdDate: expect.any(BigInt),
      currency: Currency.ICP,
      id: expect.any(BigInt),
      memberThreshold: 5,
      modifiedDate: expect.any(BigInt),
      state: ObjectState.ACTIVE,
      type: PolicyType.THRESHOLD_POLICY,
      vault: vaultFirst.id,
      wallets: undefined,
    })
  })
  it("get policies test", async () => {
    const policies = await getPolicies(vaultFirst.id)
    expect(policies.length).toEqual(2) //+default one
  })
  it("update policy test", async () => {
    policy.amountThreshold = BigInt(10)
    policy.wallets = [wallet.uid]
    const updated = await updatePolicy(policy)
    console.log(updated)

    expect(updated).toEqual({
      amountThreshold: BigInt(10),
      createdDate: expect.any(BigInt),
      currency: Currency.ICP,
      id: expect.any(BigInt),
      memberThreshold: 5,
      modifiedDate: expect.any(BigInt),
      state: ObjectState.ACTIVE,
      type: PolicyType.THRESHOLD_POLICY,
      vault: vaultFirst.id,
      wallets: expect.any(Array),
    })
  })
  let registeredTransaction: Transaction
  it("create transaction test", async () => {
    const targetAddress = principalToAddress(
      //@ts-ignore
      Principal.fromText(VAULT_CANISTER_ID),
      fromHexString(wallet.uid),
    )
    registeredTransaction = await registerTransaction({
      address: targetAddress,
      amount: BigInt(15),
      from_sub_account: wallet.uid,
    })
    expect(registeredTransaction).toEqual({
      amount: BigInt(15),
      amountThreshold: BigInt(10),
      approves: [
        {
          createdDate: expect.any(BigInt),
          signer: expect.any(String),
          status: TransactionState.APPROVED,
        },
      ],
      blockIndex: undefined,
      createdDate: expect.any(BigInt),
      currency: Currency.ICP,
      id: expect.any(BigInt),
      memberThreshold: 5,
      modifiedDate: expect.any(BigInt),
      policyId: expect.any(BigInt),
      state: TransactionState.PENDING,
      to: targetAddress,
      vaultId: expect.any(BigInt),
      from_sub_account: expect.any(String),
      owner: address,
      memo: undefined,
    })

    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(memberIdentity)
    replaceActorIdentity(vault, delegationIdentity)
  })
  it("approve transaction test", async () => {
    const approvedTransaction = await approveTransaction({
      state: TransactionState.APPROVED,
      transactionId: registeredTransaction.id,
    })
    expect(approvedTransaction.id).toEqual(registeredTransaction.id)
    expect(approvedTransaction.approves.length).toEqual(2)

    const transactions = await getTransactions()
    expect(transactions.length).toBe(1)
    expect(transactions[0].id).toBe(approvedTransaction.id)
  })
})
