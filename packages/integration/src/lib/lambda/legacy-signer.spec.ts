import { DelegationChain, Ed25519KeyIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

import { type DelegationChain as CandidDelegationChain } from "../_ic_api/ecdsa_storage.d"
import {
  isCanisterOnly,
  toDelegationChain,
  unwrap,
  withCanisterFallback,
} from "./legacy-signer"

const CANISTER_ID = "nux62-yqaaa-aaaak-ae2pq-cai"
const OTHER_CANISTER_ID = "zhr63-daaaa-aaaap-qbh4q-cai"
const flagKey = (canisterId: string) =>
  `nfid.legacySigner.canisterOnly.${canisterId}`
const env = globalThis as unknown as { IC_SIGNER_CANISTER_ID: string }

describe("withCanisterFallback", () => {
  const original = env.IC_SIGNER_CANISTER_ID

  beforeEach(() => {
    env.IC_SIGNER_CANISTER_ID = CANISTER_ID
    localStorage.clear()
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  afterEach(() => {
    env.IC_SIGNER_CANISTER_ID = original
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it("returns the lambda result without calling the canister", async () => {
    const lambda = jest.fn().mockResolvedValue("lambda")
    const canister = jest.fn().mockResolvedValue("canister")

    await expect(withCanisterFallback(lambda, canister)).resolves.toBe("lambda")

    expect(canister).not.toHaveBeenCalled()
    expect(isCanisterOnly()).toBe(false)
  })

  it("falls back to the canister when the lambda fails and remembers it", async () => {
    const lambda = jest.fn().mockRejectedValue(new Error("Forbidden"))
    const canister = jest.fn().mockResolvedValue("canister")

    await expect(withCanisterFallback(lambda, canister)).resolves.toBe(
      "canister",
    )

    expect(localStorage.getItem(flagKey(CANISTER_ID))).toBe("1")
  })

  it("skips the lambda once the canister is remembered", async () => {
    localStorage.setItem(flagKey(CANISTER_ID), "1")
    const lambda = jest.fn().mockResolvedValue("lambda")
    const canister = jest.fn().mockResolvedValue("canister")

    await expect(withCanisterFallback(lambda, canister)).resolves.toBe(
      "canister",
    )

    expect(lambda).not.toHaveBeenCalled()
  })

  it("ignores the flag of another canister", async () => {
    localStorage.setItem(flagKey(OTHER_CANISTER_ID), "1")
    const lambda = jest.fn().mockResolvedValue("lambda")
    const canister = jest.fn().mockResolvedValue("canister")

    await expect(withCanisterFallback(lambda, canister)).resolves.toBe("lambda")

    expect(canister).not.toHaveBeenCalled()
  })

  it("throws the canister error when both fail and does not remember it", async () => {
    const lambda = jest.fn().mockRejectedValue(new Error("lambda down"))
    const canister = jest
      .fn()
      .mockRejectedValue(new Error("No global key for this account"))

    await expect(withCanisterFallback(lambda, canister)).rejects.toThrow(
      "No global key for this account",
    )

    expect(isCanisterOnly()).toBe(false)
  })

  it("throws the lambda error when no canister is configured", async () => {
    env.IC_SIGNER_CANISTER_ID = ""
    localStorage.setItem(flagKey(""), "1")
    const lambda = jest.fn().mockRejectedValue(new Error("lambda down"))
    const canister = jest.fn().mockResolvedValue("canister")

    await expect(withCanisterFallback(lambda, canister)).rejects.toThrow(
      "lambda down",
    )

    expect(canister).not.toHaveBeenCalled()
  })
})

describe("legacy signer", () => {
  it("maps the canister delegation chain without changing any byte", async () => {
    // Given a chain signed the way the canister signs it
    const signer = Ed25519KeyIdentity.generate(new Uint8Array(32).fill(1))
    const session = Ed25519KeyIdentity.generate(new Uint8Array(32).fill(2))
    const targets = [Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")]
    const expected = await DelegationChain.create(
      signer,
      session.getPublicKey(),
      new Date(1_767_225_600_000),
      { targets },
    )
    const { delegation, signature } = expected.delegations[0]
    const candid: CandidDelegationChain = {
      delegations: [
        {
          delegation: {
            pubkey: Array.from(delegation.pubkey),
            expiration: delegation.expiration,
            targets: [targets],
          },
          signature: Array.from(new Uint8Array(signature)),
        },
      ],
      public_key: new Uint8Array(expected.publicKey),
    }

    // When it is converted
    const actual = toDelegationChain(candid)

    // Then it is identical to the original chain
    expect(JSON.stringify(actual.toJSON())).toEqual(
      JSON.stringify(expected.toJSON()),
    )
  })

  it("keeps an unrestricted delegation without targets", () => {
    const actual = toDelegationChain({
      delegations: [
        {
          delegation: { pubkey: [1, 2], expiration: BigInt(5), targets: [] },
          signature: [3],
        },
      ],
      public_key: [4],
    })

    expect(actual.delegations[0].delegation.targets).toBeUndefined()
  })

  it("throws the canister error", () => {
    expect(unwrap({ Ok: 1 })).toEqual(1)
    expect(() => unwrap({ Err: "No global key for this account" })).toThrow(
      "No global key for this account",
    )
  })
})
