/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { principalToAddress } from "ictool"

import { replaceIdentity } from "../auth-state"
import { generateDelegationIdentity } from "../test-utils"
import {
  addMemberToVault,
  approveTransaction,
  getPolicies,
  getTransactions,
  getVaultMembers,
  getVaults,
  getWallets,
  registerPolicy,
  registerTransaction,
  registerVault,
  registerWallet,
  walletAddress,
} from "./index"
import { Currency, PolicyType, State, VaultMember, VaultRole } from "./types"

describe("Vault suite", () => {
  jest.setTimeout(100000)

  it("vault register test", async () => {
    const mockedIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceIdentity(delegationIdentity)
    const vaultFirst = await registerVault("first")
    const address = principalToAddress(
      mockedIdentity.getPrincipal() as any,
      Array(32).fill(1),
    )

    expect(vaultFirst).toEqual({
      id: expect.any(BigInt),
      name: "first",
      members: [{ name: undefined, userId: address, role: VaultRole.Admin }],
      policies: expect.any(BigUint64Array),
      wallets: expect.any(BigUint64Array),
    })

    const vaultSecond = await registerVault("second")
    expect(vaultSecond).toEqual({
      id: expect.any(BigInt),
      name: "second",
      members: [{ name: undefined, userId: address, role: VaultRole.Admin }],
      policies: expect.any(BigUint64Array),
      wallets: expect.any(BigUint64Array),
    })

    const vaults = await getVaults()
    expect(vaults).toEqual([vaultFirst, vaultSecond])

    let members = await getVaultMembers(vaultFirst.id)
    expect(members.length).toEqual(1)
    const memberIdentity = Ed25519KeyIdentity.generate()
    const memberAddress = principalToAddress(
      memberIdentity.getPrincipal(),
      Array(32).fill(1),
    )
    await addMemberToVault({
      vaultId: vaultFirst.id,
      memberAddress,
      name: "Test Name",
      role: VaultRole.Member,
    })
    members = await getVaultMembers(vaultFirst.id)
    expect(members.length).toEqual(2)
    const member = members.find(
      (l) => l.userId === memberAddress,
    ) as VaultMember
    expect(member).toEqual({
      name: "Test Name",
      role: VaultRole.Member,
      userId: memberAddress,
    })

    const wallet1 = await registerWallet({
      name: "Wallet1",
      vaultId: vaultFirst.id,
    })
    const wallet2 = await registerWallet({
      name: "Wallet2",
      vaultId: vaultFirst.id,
    })
    expect(wallet1.name).toEqual("Wallet1")
    expect(wallet2.name).toEqual("Wallet2")
    const wallets = await getWallets(vaultFirst.id)
    expect(wallets.length).toEqual(2)

    const [policy1, policy2] = await Promise.all([
      registerPolicy({
        amountThreshold: BigInt(1),
        currency: Currency.ICP,
        memberThreshold: 5,
        type: PolicyType.ThresholdPolicy,
        walletIds: undefined,
        vaultId: vaultFirst.id,
      }),
      registerPolicy({
        amountThreshold: BigInt(1),
        currency: Currency.ICP,
        memberThreshold: 5,
        type: PolicyType.ThresholdPolicy,
        walletIds: [wallet1.id],
        vaultId: vaultFirst.id,
      }),
    ])

    const policies = await getPolicies(vaultFirst.id)

    expect(policies.length).toEqual(2)
    const firstPolicy = policies.find((l) => l.id === policy1.id)

    expect(firstPolicy?.walletIds).toEqual(undefined)
    expect(firstPolicy?.currency).toEqual(Currency.ICP)
    expect(firstPolicy?.memberThreshold).toEqual(5)
    expect(firstPolicy?.amountThreshold.toString()).toEqual(
      BigInt(1).toString(),
    )

    const secondPolicy = policies.find((l) => l.id === policy2.id)
    expect(secondPolicy?.walletIds?.length).toEqual(1)
    expect(secondPolicy?.walletIds?.[0].toString()).toEqual(
      wallet1.id.toString(),
    )
    const targetAddress = await walletAddress(BigInt(1))
    const registeredTransaction = await registerTransaction({
      address: targetAddress,
      amount: BigInt(1),
      walletId: wallet1.id,
    })
    expect(registeredTransaction).toEqual({
      amount: BigInt(1),
      amountThreshold: expect.any(BigInt),
      approves: [
        {
          createdDate: expect.any(BigInt),
          signer: expect.any(String),
          status: State.APPROVED,
        },
      ],
      blockIndex: undefined,
      createdDate: expect.any(BigInt),
      currency: Currency.ICP,
      id: expect.any(BigInt),
      memberThreshold: 5,
      modifiedDate: expect.any(BigInt),
      policyId: expect.any(BigInt),
      state: State.PENDING,
      to: targetAddress,
      vaultId: expect.any(BigInt),
      walletId: expect.any(BigInt),
    })
    replaceIdentity(memberIdentity)

    const approvedTransaction = await approveTransaction({
      state: State.APPROVED,
      transactionId: registeredTransaction.id,
    })
    expect(approvedTransaction.id).toEqual(registeredTransaction.id)
    expect(approvedTransaction.approves.length).toEqual(2)

    const transactions = await getTransactions()
    expect(transactions.length).toBe(1)
    expect(transactions[0].id).toBe(approvedTransaction.id)
  })

  it("test subaddress", async () => {
    const actual = await walletAddress(BigInt(1))
    expect(
      "1dbb387996dbb10113df15757452044f78d5c6aec83aa0a6ec1d2c0c12c80671",
    ).toEqual(actual)
  })
})
