import { Actor, ActorSubclass, Agent, HttpAgent } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"

export async function validateTargets(targets: string[], origin: string) {
  const agent: Agent = await new HttpAgent({ host: "https://ic0.app" })
  const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
    IDL.Service({
      get_trusted_origins: IDL.Func([], [IDL.Vec(IDL.Text)], []),
    })
  const promises = targets.map(async (canisterId) => {
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
