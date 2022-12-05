/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { principalToAddress } from "ictool"

import { replaceIdentity } from "../auth-state"
import { generateDelegationIdentity } from "../test-utils"
import {
  addMemberToVault,
  getPolicies,
  getVaultMembers,
  getVaults,
  getWallets,
  registerPolicy,
  registerVault,
  registerWallet,
  walletAddress,
} from "./index"
import {
  Currency,
  PolicyType,
  ThresholdPolicy,
  VaultMember,
  VaultRole,
} from "./types"

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
    const memberAddress = principalToAddress(
      Ed25519KeyIdentity.generate().getPrincipal() as any,
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

    const [policy1] = await Promise.all([
      registerPolicy({
        amountThreshold: BigInt(1),
        currency: Currency.ICP,
        memberThreshold: 1,
        type: PolicyType.ThresholdPolicy,
        walletIds: undefined,
        vaultId: vaultFirst.id,
      }),

      registerPolicy({
        amountThreshold: BigInt(1),
        currency: Currency.ICP,
        memberThreshold: 1,
        type: PolicyType.ThresholdPolicy,
        walletIds: [wallet1.id],
        vaultId: vaultFirst.id,
      }),
    ])

    const policies = await getPolicies(vaultFirst.id)

    expect(policies.length).toEqual(2)
    const firstPolicy = policies[0] as ThresholdPolicy
    const secondPolicy = policies[1] as ThresholdPolicy
    expect(firstPolicy.id).toEqual(policy1.id)
    expect(firstPolicy.walletIds).toEqual(undefined)
    expect(firstPolicy.currency).toEqual(Currency.ICP)
    expect(firstPolicy.memberThreshold).toEqual(1)
    expect(firstPolicy.amountThreshold.toString()).toEqual(BigInt(1).toString())
    expect(secondPolicy.walletIds?.length).toEqual(1)
    expect(secondPolicy?.walletIds?.[0].toString()).toEqual(
      wallet1.id.toString(),
    )
  })

  it("test subaddress", async () => {
    const actual = await walletAddress(BigInt(1))
    expect(
      "1c016881d9e01ee163f9c5f698636e25ea095fb86ffa977b28254703286b91db",
    ).toEqual(actual)
  })
})
