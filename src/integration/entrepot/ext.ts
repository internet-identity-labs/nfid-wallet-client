import { Identity } from "@dfinity/agent/lib/cjs/auth"
import { Principal } from "@dfinity/principal"
import { decodeTokenIdentifier, principalToAddress } from "ictool"

import {
  AccountIdentifier,
  Balance,
  ListResult,
  LockResult,
  TransferRequest,
  TransferResult,
} from "frontend/integration/_ic_api/ext.did"
import { extIDL } from "frontend/integration/_ic_api/ext_idl"
import { initActor } from "frontend/integration/actors"
import { isHex } from "frontend/ui/utils"

export async function transferEXT(
  token: string,
  source: Identity,
  target: string,
): Promise<Balance> {
  let actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  let request: TransferRequest = {
    token: token,
    from: constructUser(source.getPrincipal().toText()),
    subaccount: [],
    to: constructUser(target),
    amount: 1,
    memo: [],
    notify: false,
  }
  const result: TransferResult = (await actor.transfer(request).catch((e) => {
    throw Error(`Transfer failed!: ${e}`, e)
  })) as TransferResult
  if ("err" in result)
    throw Error("Transfer failed! " + formatError(result.err))
  return result.ok
}

export async function lockNFT(
  token: string,
  source: Identity,
  price: number,
): Promise<AccountIdentifier> {
  let actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  const result = (await actor
    .lock(
      token,
      BigInt(price),
      principalToAddress(source.getPrincipal() as any),
      [],
    )
    .catch((e) => {
      throw Error(`Lock failed!: ${e}`, e)
    })) as LockResult
  if ("err" in result) {
    throw Error("Lock failed! " + formatError(result.err))
  }
  return result.ok
}

export async function listNFT(
  token: string,
  source: Identity,
  price: number,
): Promise<boolean> {
  let actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  const request = {
    token: token,
    from_subaccount: [],
    price: [BigInt(price)],
  }
  const result = (await actor.list(request).catch((e) => {
    throw Error(`List failed!: ${e}`, e)
  })) as ListResult
  if ("err" in result) throw Error("List failed! " + formatError(result.err))
  return result.ok === null
}

export async function unListNFT(
  token: string,
  source: Identity,
): Promise<boolean> {
  let actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  const request = {
    token: token,
    from_subaccount: [],
    price: [],
  }
  const result = (await actor.list(request).catch((e) => {
    throw Error(`UnList failed!: ${e}`, e)
  })) as LockResult
  if ("err" in result) throw Error("UnList failed! " + formatError(result.err))
  return result.ok === null
}

const constructUser = (u: string) => {
  if (isHex(u) && u.length === 64) {
    return { address: u }
  } else {
    return { principal: Principal.fromText(u) }
  }
}

// @ts-ignore
function formatError(err) {
  return Object.keys(err)[0] + " : " + Object.values(err)[0]
}
