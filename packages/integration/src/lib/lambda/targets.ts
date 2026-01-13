import crypto from "crypto"

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

import { storageWithTtl } from "@nfid/client-db"

import { verifyCertification } from "./cert-verification"
import { getLookupResultValue } from "./cert-verification/utils"

export interface CertifiedResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  response: Array<string>
}

export interface ICRC28Response {
  trusted_origins: Array<string>
}

const TRUSTED_ORIGINS_CACHE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000 // 1 day

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
            trusted_origins: IDL.Vec(IDL.Text),
          }),
        ],
        [],
      ),
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
      if (!result?.response.includes(origin)) {
        uncertifiedTargets.push(canisterId)
      } else {
        await verifyCertifiedResponse(result, "origins", canisterId)
      }
    } catch (_e) {
      uncertifiedTargets.push(canisterId)
    }
  })
  await Promise.all(promisesCertified)

  const promises = uncertifiedTargets.map(async (canisterId) => {
    const actor: ActorSubclass = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    })
    const cacheKey = `trusted_origins_${canisterId}`
    const cachedTrOrigins = await storageWithTtl.get(cacheKey)
    if (cachedTrOrigins) {
      if ((cachedTrOrigins as string[]).includes(origin)) {
        return
      }
    }
    const result = (await actor["icrc28_trusted_origins"]()) as ICRC28Response
    if (!result.trusted_origins.includes(origin)) {
      throw new Error(
        `Target canister ${canisterId} does not support "${origin}"`,
      )
    }
    await storageWithTtl.set(
      cacheKey,
      result.trusted_origins,
      TRUSTED_ORIGINS_CACHE_EXPIRATION_MILLIS,
    )
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
    rootKey: agent.rootKey!,
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
    const valueBytes = new Uint8Array(value)

    if (compare(byteArray.buffer, valueBytes.buffer) !== 0) {
      throw new Error("Response hash does not match")
    }
  } else {
    throw new Error("Response not found in tree")
  }
}
