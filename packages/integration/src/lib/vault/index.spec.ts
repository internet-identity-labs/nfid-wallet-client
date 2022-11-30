/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { principalToAddress } from "ictool"

import { replaceIdentity } from "../auth-state"
import { generateDelegationIdentity } from "../test-utils"
import { addMemberToVault, getVaultMembers, getVaults, registerVault } from "./index"
import { VaultMember, VaultRole } from "./types"

describe("Vault suite", () => {
  jest.setTimeout(100000)

  it("vault register test", async function() {
    const mockedIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceIdentity(delegationIdentity)
    const vaultFirst = await registerVault("first")
    const address = principalToAddress(
      mockedIdentity.getPrincipal() as any,
      Array(32).fill(1),
    )
    expect(vaultFirst.name).toEqual("first")
    expect(vaultFirst.members.length).toEqual(1)
    expect(vaultFirst.members[0].user_uuid).toEqual(address)
    expect(vaultFirst.members[0].role).toEqual(
      VaultRole.Admin,
    )
    const vaultSecond = await registerVault("second")
    expect(vaultSecond.name).toEqual("second")
    expect(vaultSecond.members.length).toEqual(1)
    expect(vaultSecond.members[0].user_uuid).toEqual(address)
    expect(vaultSecond.members[0].role).toEqual(
      VaultRole.Admin,
    )
    const vaults = await getVaults()
    expect(vaults[0]).toEqual(vaultFirst)
    expect(vaults[1]).toEqual(vaultSecond)

    let members = await getVaultMembers(vaultFirst.id)
    expect(members.length).toEqual(1)
    const memberAddress = principalToAddress(
      Ed25519KeyIdentity.generate().getPrincipal() as any,
      Array(32).fill(1),
    )
    await addMemberToVault(vaultFirst.id, memberAddress, "Test Name", VaultRole.Member)
    members = await getVaultMembers(vaultFirst.id)
    expect(members.length).toEqual(2)
    const member = members.find(l=>l.user_uuid === memberAddress) as VaultMember
    expect(member.name).toEqual("Test Name")
    expect(member.role).toEqual(VaultRole.Member)
  })
})
