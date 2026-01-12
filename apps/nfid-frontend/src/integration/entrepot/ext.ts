import { Identity } from "@dfinity/agent/lib/cjs/auth"
import { AccountIdentifier as AccountIdentifierAddress } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { isHex } from "@nfid-frontend/utils"
import { initActor } from "@nfid/integration"

import { extIDL } from "frontend/integration/_ic_api/ext"
import {
  AccountIdentifier,
  Balance,
  ListResult,
  LockResult,
  TransferRequest,
  TransferResult,
} from "frontend/integration/_ic_api/ext.d"

export async function transferEXT(
  token: string,
  source: Identity,
  target: string,
): Promise<Balance> {
  const actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  const request: TransferRequest = {
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
  identity: Identity,
  price: number,
): Promise<AccountIdentifier> {
  const actor = await initActor(
    identity,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  const result = (await actor
    .lock(
      token,
      BigInt(price),
      AccountIdentifierAddress.fromPrincipal({
        principal: identity.getPrincipal(),
      }).toHex(),
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
  identity: Identity,
  price: number,
): Promise<boolean> {
  const actor = await initActor(
    identity,
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
  identity: Identity,
): Promise<boolean> {
  const actor = await initActor(
    identity,
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

function formatError(err: { [key: string]: any }) {
  return Object.keys(err)[0] + " : " + Object.values(err)[0]
}

export function encodeTokenIdentifier(canister: string, index: number): string {
  const padding = Buffer.from("\x0Atid")
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(canister).toUint8Array(),
    ...to32bits(index),
  ])
  return Principal.fromUint8Array(array).toText()
}

export function decodeTokenIdentifier(tid: string): {
  index: number
  canister: string
} {
  const bytes = Principal.fromText(tid).toUint8Array()
  const padding = Array.from(bytes.subarray(0, 4))
  if (
    toHexString(padding) !== toHexString(Array.from(Buffer.from("\x0Atid")))
  ) {
    throw new Error(`Invalid token identifier "${tid}"`)
  } else {
    return {
      index: from32bits(Array.from(bytes.subarray(-4))),
      canister: Principal.fromUint8Array(bytes.subarray(4, -4)).toText(),
    }
  }
}

export function to32bits(num: number): number[] {
  const b = new ArrayBuffer(4)
  new DataView(b).setUint32(0, num)
  return Array.from(new Uint8Array(b))
}

export function from32bits(bytes: number[]): number {
  let value
  for (let i = 0; i < 4; i++) {
    // @ts-ignore
    value = (value << 8) | bytes[i]
  }
  if (value === undefined) {
    throw new Error(`Could not decode number from bytes: ${bytes.join(" ")}`)
  }
  return value
}

export function toHexString(bytes: number[]): string {
  return Array.from(bytes, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2)
  }).join("")
}
