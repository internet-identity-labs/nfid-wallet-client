import { Ed25519KeyIdentity } from "@dfinity/identity"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { mockIdentityA } from "@nfid/integration"

import { Icrc1Pair } from "./Icrc1-pair"

describe.skip("ICRC1 pair suite", () => {
  jest.setTimeout(200000)
  it("should get allowances", async () => {
    const identity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const icrc1Pair = new Icrc1Pair("mih44-vaaaa-aaaaq-aaekq-cai", undefined)
    const allowances = await icrc1Pair.getIcrc2Allowances(
      identity.getPrincipal(),
    )
    console.log("allowances", allowances)
    expect(allowances.length).toEqual(0)
    const allowedBlock = await icrc1Pair.setAllowance(
      identity,
      Principal.fromText("mih44-vaaaa-aaaaq-aaekq-cai"),
      BigInt(1000000000000000000),
    )
    expect(allowedBlock).toBeGreaterThan(0)
    const allowances2 = await icrc1Pair.getIcrc2Allowances(
      identity.getPrincipal(),
    )
    expect(allowances2.length).toEqual(1)
    expect(allowances2[0].allowance).toEqual(BigInt(1000000000000000000))
    expect(allowances2[0].expires_at).toBeUndefined()
    const revokedBlock = await icrc1Pair.setAllowance(
      identity,
      Principal.fromText("mih44-vaaaa-aaaaq-aaekq-cai"),
      BigInt(0),
    )
    expect(revokedBlock).toBeGreaterThan(0)
    const allowances3 = await icrc1Pair.getIcrc2Allowances(
      Principal.fromText("mih44-vaaaa-aaaaq-aaekq-cai"),
    )
    expect(allowances3.length).toEqual(0)
    const icpPair = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", undefined)
    const icpAllowances = await icpPair.getIcrc2Allowances(
      identity.getPrincipal(),
    )
    const accId = AccountIdentifier.fromPrincipal({
      principal: identity.getPrincipal(),
    }).toHex()
    console.log("accId", accId)
    console.log("icpAllowances", icpAllowances)
    const allowedBlock2 = await icpPair.removeApprovalICPLedger(
      identity,
      "069dbf62315b6241d488e4f31eece5dda7ca5be9f0b897e1bde9b18bcfe24a4c",
    )
    expect(allowedBlock2).toBeGreaterThan(0)
    const icpAllowances2 = await icpPair.getIcrc2Allowances(
      identity.getPrincipal(),
    )
    console.log("icpAllowances2", icpAllowances2)
  })
})
