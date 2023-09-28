import { Actor, ActorSubclass, Agent, HttpAgent } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"

export interface CertifiedResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  response: Array<string>
}
export async function validateTargets(targets: string[], origin: string) {
  const agent: Agent = await new HttpAgent({ host: "https://ic0.app" })
  const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
    IDL.Service({
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
      get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
    })

  const uncertifiedTargets: string[] = []

  const promisesCertified = targets.map(async (canisterId) => {
    const actor: ActorSubclass = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    })

    let result
    try {
      result = (await actor[
        "get_trusted_origins_certified"
      ]()) as CertifiedResponse
      if (!result || !result.response.includes(origin)) {
        uncertifiedTargets.push(canisterId)
      }
    } catch (e) {
      //not implemented - will try with the update call
      uncertifiedTargets.push(canisterId)
    }
  })
  await Promise.all(promisesCertified)

  const promises = uncertifiedTargets.map(async (canisterId) => {
    const actor: ActorSubclass = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    })
    const result = (await actor["get_trusted_origins"]()) as string[]
    if (!result.includes(origin)) {
      throw new Error(
        `Target canister ${canisterId} does not support "${origin}"`,
      )
    }
  })

  await Promise.all(promises)
}
