import {
  Actor,
  ActorMethod,
  ActorSubclass,
  Certificate,
  HttpAgent,
} from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { Principal } from "@dfinity/principal"
import { writeFileSync } from "fs"

const candidUICanister = "a4gq6-oaaaa-aaaab-qaa4q-cai"

export async function getCandidMetadata(
  canisterId: string,
  agent: HttpAgent,
): Promise<string> {
  let canister = Principal.fromText(canisterId)
  let encoder = new TextEncoder()
  let pathCandid = [
    encoder.encode("canister"),
    canister.toUint8Array().buffer,
    encoder.encode("metadata"),
    encoder.encode("candid:service"),
  ]
  let responseCandid
  try {
    responseCandid = await agent.readState(canister, { paths: [pathCandid] })
  } catch (e) {
    throw new Error(
      `Not possible to retrieve candid file from the canister ${canisterId} : ` +
        e,
    )
  }
  const certCandid = await Certificate.create({
    certificate: responseCandid.certificate,
    rootKey: agent.rootKey,
    canisterId: canister,
  })
  const dataCandid = certCandid.lookup(pathCandid)
  return new TextDecoder().decode(dataCandid)
}

export async function transformDidToJs(
  candid: string,
  agent: HttpAgent,
): Promise<string> {
  const transformInterface: IDL.InterfaceFactory = ({ IDL }) =>
    IDL.Service({
      did_to_js: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    })
  const didJs: ActorSubclass = Actor.createActor(transformInterface, {
    agent,
    canisterId: candidUICanister,
  })
  const result: any = await didJs.did_to_js(candid)
  if (result === []) {
    throw Error("Did to Js transformation error")
  }
  return result[0]
}

//todo @philip will extend this one with proper js solution sc-5145
export async function createActorDynamically(
  js: string,
  canisterId: string,
): Promise<Actor & Record<string, ActorMethod>> {
  let agent = new HttpAgent({ host: "https://ic0.app" })
  let fileName = "src/integration/_ic_api/" + canisterId + ".js"
  writeFileSync(fileName, js, {
    flag: "w",
  })
  //todo validate to not import malicious script instead id
  let module = await import("./../_ic_api/" + canisterId + ".js")
  return Actor.createActor(module.idlFactory, { agent, canisterId })
}

//todo TBD sc-5147
export async function evaluateMethod(
  actor: ActorSubclass,
  methodName: string,
  params?: string,
) {
  return eval("actor." + methodName + "()")
}
