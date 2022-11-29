/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { principalToAddress } from "ictool"

import { replaceIdentity } from "../auth-state"
import { generateDelegationIdentity } from "../test-utils"
import { getVaults, registerVault } from "./index"

describe("Vault suite", () => {
  jest.setTimeout(100000)

  it("vault register test", async function () {
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
    expect(vaultFirst.members[0].role.hasOwnProperty("VaultOwner")).toEqual(
      true,
    )
    const vaultSecond = await registerVault("second")
    expect(vaultSecond.name).toEqual("second")
    expect(vaultFirst.members.length).toEqual(1)
    expect(vaultFirst.members[0].user_uuid).toEqual(address)
    expect(vaultFirst.members[0].role.hasOwnProperty("VaultOwner")).toEqual(
      true,
    )
    const vaults = await getVaults()
    expect(vaults[0]).toEqual(vaultFirst)
    expect(vaults[1]).toEqual(vaultSecond)
  })
})
