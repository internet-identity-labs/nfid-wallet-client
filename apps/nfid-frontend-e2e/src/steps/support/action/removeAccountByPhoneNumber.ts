/**
 * Remove user Account by Test Phone Number.
 */
import { Actor, HttpAgent, fromHex } from "@dfinity/agent"
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1"
// global.fetch = require("node-fetch")
import fetch from "node-fetch"
import sha256 from "sha256"

import { idlFactory } from "./actors/identity-manager.js"

const LAMBDA_IDENTITY = process.env.LAMBDA_IDENTITY
const IDENTITY_MANAGER_CANISTER_ID = process.env.IDENTITY_MANAGER_CANISTER_ID
const IC_HOST = process.env.IC_HOST

//@ts-ignore
global.fetch = fetch

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

export function getIdentity(): Secp256k1KeyIdentity {
  if (!LAMBDA_IDENTITY) {
    throw Error("No LAMBDA_IDENTITY provided.")
  }
  const secretKey = fromHex(LAMBDA_IDENTITY.trim())
  return Secp256k1KeyIdentity.fromSecretKey(secretKey)
}
