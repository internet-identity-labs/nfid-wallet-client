import { Actor, ActorSubclass, Agent, HttpAgent } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"

import { localStorageTTL } from "../util/local-strage-ttl"
import { CertifiedResponse, validateTargets } from "./targets"

describe("Targets validation", () => {
  jest.setTimeout(50000)

  it("validate", async function () {
    localStorageTTL.clear()
    try {
      await validateTargets(["irshc-3aaaa-aaaam-absla-cai"], "nfid.one")
    } catch (e) {
      fail("Should pass")
    }
  })

  it("validate fail", async function () {
    localStorageTTL.clear()
    try {
      await validateTargets(["irshc-3aaaa-aaaam-absla-cai"], "hernia.one")
    } catch (e) {
      expect((e as Error).message).toContain(
        "Target canister irshc-3aaaa-aaaam-absla-cai does not support",
      )
    }
  })

  it("validate certified", async function () {
    localStorageTTL.clear()
    const agent: Agent = await new HttpAgent({ host: "https://ic0.app" })
    const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
      IDL.Service({
        update_trusted_origins: IDL.Func(
          [IDL.Vec(IDL.Text)],
          [IDL.Vec(IDL.Text)],
          [],
        ),
        update_trusted_origins_raw: IDL.Func(
          [IDL.Vec(IDL.Text)],
          [IDL.Vec(IDL.Text)],
          [],
        ),
        get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
        get_trusted_origins_certified: IDL.Func(
          [],
          [
            IDL.Record({
              certificate: IDL.Vec(IDL.Nat8),
              witness: IDL.Vec(IDL.Nat8),
              response: IDL.Vec(IDL.Text),
            }),
          ],
          ["query"],
        ),
      })
    const canisterId = "c543j-2qaaa-aaaal-ac4dq-cai"
    const actor: ActorSubclass = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    })
    const currentStateCertified = (await actor[
      "get_trusted_origins_certified"
    ]()) as CertifiedResponse
    const currentStateUnCertified = (await actor[
      "get_trusted_origins"
    ]()) as string[]

    await actor["update_trusted_origins"](["noncertified.one", "nfid.one"])
    await actor["update_trusted_origins_raw"](["nfid.one"])

    try {
      await validateTargets([canisterId], "noncertified.one")
    } catch (e) {
      console.log(e)
      fail("Should pass")
    }
    await actor["update_trusted_origins"](["noncertified.one"])
    await actor["update_trusted_origins_raw"](["nfid.one"])

    try {
      await validateTargets([canisterId], "nfid.one")
    } catch (e) {
      fail("Should pass")
    }

    await actor["update_trusted_origins"](currentStateCertified.response)
    await actor["update_trusted_origins_raw"](currentStateUnCertified)
  })
})
