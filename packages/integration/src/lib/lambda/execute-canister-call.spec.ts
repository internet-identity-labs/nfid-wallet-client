import {IDL} from "@dfinity/candid";
import {expect} from "@jest/globals";
import {executeCanisterCall} from "./execute-canister-call";
import {DelegationChain, DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity";
import {getIdentity} from "./util";

describe("Targets validation", () => {
  jest.setTimeout(50000)

  it("validate without params", async function () {
    const idl = {
      get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
    }
    const mockedIdentity = getIdentity("87654321876543218765432187654311")
    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
      const param1 =10000

    const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)
    const canisterId = "rdmx6-jaaaa-aaaaa-aaadq-cai";

    const response = await executeCanisterCall(di, "lookup", canisterId, stringifyParams(param1))
    expect(JSON.stringify(response)).toContain("alias")
  })

})


function stringifyParams (...params: any) {
  return JSON.stringify(params)
}
