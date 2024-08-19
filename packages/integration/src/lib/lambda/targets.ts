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

export interface ICRC28TrustedOriginsResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  trusted_origins: Array<string>
}

export async function validateTargets(targets: string[], origin: string) {
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
      icrc28_trusted_origins: IDL.Func(
        [],
        [
          IDL.Record({
            certificate: IDL.Vec(IDL.Nat8),
            witness: IDL.Vec(IDL.Nat8),
            trusted_origins: IDL.Vec(IDL.Text),
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
    let result: CertifiedResponse | undefined
    try {
      try {
        const icrc28: ICRC28TrustedOriginsResponse = (await actor[
          "icrc28_trusted_origins"
        ]()) as ICRC28TrustedOriginsResponse
        result = {
          certificate: icrc28.certificate,
          witness: icrc28.witness,
          response: icrc28.trusted_origins,
        }
      } catch (e) {
        console.warn("ICRC28 not supported")
      }
      //support old implementation
      if (!result || !result.response.includes(origin)) {
        result = (await actor[
          "get_trusted_origins_certified"
        ]()) as CertifiedResponse
        if (!result || !result.response.includes(origin)) {
          console.warn("get_trusted_origins_certified not supported")
          uncertifiedTargets.push(canisterId)
        }
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
    //TODO do we really need it?
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
