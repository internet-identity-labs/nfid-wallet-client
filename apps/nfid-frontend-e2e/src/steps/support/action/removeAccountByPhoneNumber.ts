/**
 * Remove user Account by Test Phone Number.
 */
import { Actor, HttpAgent } from "@dfinity/agent"
import { Secp256k1KeyIdentity } from "@dfinity/identity"
import sha256 from "sha256"

import { idlFactory } from "../../../../../nfid-frontend/src/integration/_ic_api/identity_manager"

const LAMBDA_IDENTITY = process.env.LAMBDA_IDENTITY
const IDENTITY_MANAGER_CANISTER_ID = process.env.IDENTITY_MANAGER_CANISTER_ID
const IC_HOST = process.env.IC_HOST

global.fetch = require("node-fetch")

export default async () => {
  if (!LAMBDA_IDENTITY) throw new Error("LAMBDA_IDENTITY is not defined")
  if (!IDENTITY_MANAGER_CANISTER_ID)
    throw new Error("IDENTITY_MANAGER_CANISTER_ID is not defined")

  let identity = getIdentity()
  let agent = new HttpAgent({ host: IC_HOST, identity })
  let actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: IDENTITY_MANAGER_CANISTER_ID,
  })
  await actor.remove_account_by_phone_number()
}

function getIdentity(): Secp256k1KeyIdentity {
  const rawKey: any = LAMBDA_IDENTITY?.trim()
  const rawBuffer = Uint8Array.from(rawKey).buffer
  const privateKey = Uint8Array.from(
    sha256(rawBuffer as any, { asBytes: true }),
  )
  return Secp256k1KeyIdentity.fromSecretKey(Uint8Array.from(privateKey).buffer)
}
