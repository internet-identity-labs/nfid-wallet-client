import { IDL } from "@dfinity/candid"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"

import { expect } from "@jest/globals"

import { getGlobalDelegationChain } from "../delegation-factory/delegation-i"
import { getAnonymousDelegate } from "../internet-identity"

import {
  DEFAULT_EXPIRAITON_TIME_MILLIS,
  saveToStorage,
} from "./domain-key-repository"
import { executeCanisterCall } from "./execute-canister-call"
import { getIdentity } from "./util"

const identity: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

describe("Targets validation", () => {
  jest.setTimeout(50000)

  //TODO
  it.skip("get third party global keys", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(identity)

    const nfidSessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      nfidSessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const nfidDelegationIdentity = DelegationIdentity.fromDelegation(
      nfidSessionKey,
      chainRoot,
    )

    const dappSessionKey = Ed25519KeyIdentity.generate()
    // NOTE: this is what we receive from authClient
    // https://github.com/dfinity/agent-js/blob/1d35889e0d0c0fd4a33d02a341bd90ee156da1cd/packages/auth-client/src/index.ts#L517
    const dappSessionPublicKey = new Uint8Array(
      dappSessionKey.getPublicKey().toDer(),
    )

    const delegationChain = await getGlobalDelegationChain(
      nfidDelegationIdentity,
      ["irshc-3aaaa-aaaam-absla-cai"],
      dappSessionPublicKey,
      "nfid.one",
    )

    const actualIdentity = DelegationIdentity.fromDelegation(
      dappSessionKey,
      delegationChain,
    )
    const actualPrincipalId = actualIdentity.getPrincipal().toText()
    console.debug("actualPrincipalId", actualPrincipalId)

    await getAnonymousDelegate(
      dappSessionPublicKey,
      nfidDelegationIdentity,
      "nfid.one",
    )
    try {
      await executeCanisterCall(
        "nfid.one",
        nfidDelegationIdentity,
        "lookup",
        "",
      )
      throw new Error("Should not be reachable")
    } catch (e: any) {
      expect(e.message).toContain("anonymous")
    }
  })

  it("validate without params", async () => {
    const _idl = {
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
    const param1 = 10000

    const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)
    const canisterId = "rdmx6-jaaaa-aaaaa-aaadq-cai"

    await saveToStorage("nfid.one", "value1", DEFAULT_EXPIRAITON_TIME_MILLIS)
    const response = await executeCanisterCall(
      "nfid.one",
      di,
      "lookup",
      canisterId,
      stringifyParams(param1),
    )
    expect(JSON.stringify(response)).toContain("alias")
  })
})

function stringifyParams(...params: any) {
  return JSON.stringify(params)
}
