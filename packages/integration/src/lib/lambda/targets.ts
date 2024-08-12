import {
  Actor,
  ActorSubclass,
  Agent,
  compare,
  HttpAgent,
  lookup_path,
} from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { Principal } from "@dfinity/principal"
import crypto from "crypto"

import { verifyCertification } from "./cert-verification"
import { getLookupResultValue } from "./cert-verification/utils"

export interface CertifiedResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  response: Array<string>
}

export async function validateTargets(targets: string[], o: string) {
  const origin = o.includes("http") ? o : `https://${o}`
  const agent: Agent = new HttpAgent({ host: "https://ic0.app" })
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

    try {
      const result = (await actor[
        "get_trusted_origins_certified"
      ]()) as CertifiedResponse
      if (!result || !result.response.includes(origin)) {
        uncertifiedTargets.push(canisterId)
      } else {
        await verifyCertifiedResponse(result, "origins", canisterId)
      }
    } catch (e) {
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

async function verifyCertifiedResponse(
  certifiedResponse: CertifiedResponse,
  key: string,
  canisterId: string,
) {
  const agent = new HttpAgent({ host: "https://ic0.app" })
  await agent.fetchRootKey()
  const tree = await verifyCertification({
    canisterId: Principal.fromText(canisterId),
    encodedCertificate: new Uint8Array(certifiedResponse.certificate).buffer,
    encodedTree: new Uint8Array(certifiedResponse.witness).buffer,
    rootKey: agent.rootKey,
    maxCertificateTimeOffsetMs: 500000,
  })
  const treeHash = lookup_path([key], tree)
  const value = getLookupResultValue(treeHash)

  if (value) {
    const newOwnedString = certifiedResponse.response.join("")
    const sha256Result = crypto
      .createHash("sha256")
      .update(newOwnedString)
      .digest()
    const byteArray = new Uint8Array(sha256Result)
    if (!equal(byteArray, value)) {
      throw new Error("Response hash does not match")
    }
  } else {
    throw new Error("Response not found in tree")
  }
}

function equal(a: ArrayBuffer, b: ArrayBuffer): boolean {
  return compare(new Uint8Array(a), new Uint8Array(b)) === 0
}
